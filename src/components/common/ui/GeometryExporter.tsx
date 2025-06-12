import { useModularStore } from "@/stores/modular"
import { showSaveFilePicker } from "@/utils/filePicker"
import { FC, useCallback, useEffect, useMemo, useState } from "react"
import {
  BufferGeometry,
  DoubleSide,
  Mesh as ThreeMesh,
  MeshStandardMaterial,
  Object3D,
  BufferAttribute,
} from "three"
import { STLExporter } from "three-stdlib"
import Icon from "./Icon"
import { useTrayStore } from "@/stores/tray"
import { useParams } from "react-router-dom"
import Module from "manifold-3d"

// Convert Manifold Mesh to Three.js BufferGeometry
function mesh2geometry(mesh: any) {
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(mesh.vertProperties, 3))
  geometry.setIndex(new BufferAttribute(mesh.triVerts, 1))
  return geometry
}

// Convert Three.js BufferGeometry to Manifold Mesh
function geometry2mesh(geometry: BufferGeometry) {
  const positions = geometry.getAttribute("position")
  const indices = geometry.getIndex()

  const vertProperties = new Float32Array(
    (positions.array as Float32Array).slice()
  )
  const triVerts = new Uint32Array(
    indices ? (indices.array as Uint32Array).slice() : []
  )

  return { vertProperties, triVerts }
}

const GeometryExporter: FC = () => {
  const [format] = useState<string | null>("stl")
  const geometries = useModularStore((state) => state.geometries)
  const nodes = useModularStore((state) => state.nodes)

  const { totalWidth, totalDepth, totalHeight } = useTrayStore((state) => state)
  const [manifoldModule, setManifoldModule] = useState<Awaited<ReturnType<typeof Module>> | null>(null)

  const { manifoldGeometries, setManifoldGeometries } = useModularStore(
    (state) => state
  )

  const { slug } = useParams<{ slug: string }>()
  const gridCSS = (slug: string) => {
    switch (slug) {
      case "bento3d":
        return `grid-cols-1 md:grid-cols-3 [&>li:first-child]:col-span-full [&>li:not(:first-child)]:col-span-1`
      default:
        return ``
    }
  }

  const geometriesWithInfo = useMemo(() => {
    return geometries.map((geometry) => {
      const gn = nodes.filter(
        (node) => node.id === geometry.id.graphNodeSet?.nodeId
      )
      const label = gn?.[0]?.label
      return { ...geometry, label }
    })
  }, [geometries, nodes])

  const processTrayGeometry = useMemo(() => {
    if (!manifoldModule || slug !== "tray") return null

    const { Manifold, Mesh } = manifoldModule
    const trayGeometries = geometriesWithInfo
      .filter((geometry) => geometry.label?.includes("tray"))
      .sort((a, b) => {
        const numA = parseInt(a.label?.match(/\d+/)?.[0] || "0")
        const numB = parseInt(b.label?.match(/\d+/)?.[0] || "0")
        return numA - numB
      })
    console.log("trayGeometries", trayGeometries)
    if (trayGeometries.length < 4) return null

    try {
      // Convert geometries to Manifold meshes
      const manifolds = trayGeometries.map((geometry) => {
        const { vertProperties, triVerts } = geometry2mesh(geometry.geometry)
        const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
        mesh.merge()
        return new Manifold(mesh)
      })

      // tray002をすべて取得
      const tray002s = trayGeometries.filter((g) => g.label === "tray002")

      // Manifoldに変換
      const tray002Manifolds = tray002s.map((g) => {
        const { vertProperties, triVerts } = geometry2mesh(g.geometry)
        const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
        mesh.merge()
        return new Manifold(mesh)
      })

      // tray003のindexを取得
      const tray003Index = trayGeometries.findIndex(
        (g) => g.label === "tray003"
      )
      // tray003のindexを取得
      const tray004Index = trayGeometries.findIndex(
        (g) => g.label === "tray004"
      )

      // differenceを順番に適用
      let trayResult = manifolds[0]
      // 1. tray001 と tray002 の difference
      for (const tray002 of tray002Manifolds) {
        trayResult = Manifold.difference(trayResult, tray002)
      }
      // 2. 上の結果 と tray003 の difference（indexで取得）
      if (tray003Index !== -1) {
        trayResult = Manifold.difference(trayResult, manifolds[tray003Index])
      }
      // 3. 上の結果 と tray004 の union
      if (tray004Index !== -1) {
        trayResult = Manifold.union(trayResult, manifolds[tray004Index])
      }

      // Convert back to Three.js geometry
      return mesh2geometry(trayResult.getMesh())
    } catch (error) {
      console.error("Error processing geometry:", error)
      return null
    }
  }, [geometriesWithInfo, manifoldModule, slug])
  const processBentoGeometry = useMemo(() => {
    if (!manifoldModule || slug !== "bento3d") return null

    const { Manifold, Mesh } = manifoldModule
    const bentoGeometries = geometriesWithInfo
      .filter((geometry) =>
        ["lid", "box", "tray", "latch"].some((key) => geometry.label?.includes(key))
      )
      .sort((a, b) => {
        const numA = parseInt(a.label?.match(/\d+/)?.[0] || "0")
        const numB = parseInt(b.label?.match(/\d+/)?.[0] || "0")
        return numA - numB
      })
    console.log("bentoGeometries", bentoGeometries)
    if (bentoGeometries.length < 2) return null

    try {
      const manifolds = bentoGeometries.map((geometry) => {
        try {
          const { vertProperties, triVerts } = geometry2mesh(geometry.geometry)
          const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
          mesh.merge()
          return new Manifold(mesh)
        } catch (e) {
          console.error(
            `このジオメトリでManifold化に失敗: label=${
              geometry.label
            }, id=${JSON.stringify(geometry.id)}`,
            geometry,
            e
          )
          return null
        }
      })

      // trayの処理
      const tray001Index = bentoGeometries.findIndex((g) => g.label === "tray001")
      const tray002s = bentoGeometries.filter((g) => g.label === "tray002")
      const tray002Manifolds = tray002s.map((g) => {
        const { vertProperties, triVerts } = geometry2mesh(g.geometry)
        const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
        mesh.merge()
        return new Manifold(mesh)
      })

      let trayResult = manifolds[tray001Index]
      for (const tray002 of tray002Manifolds) {
        trayResult = Manifold.difference(trayResult!, tray002)
      }

      // lidの処理
      const lid001Index = bentoGeometries.findIndex((g) => g.label === "lid001")
      const lid002s = bentoGeometries.filter((g) => g.label === "lid002")
      const lid002Manifolds = lid002s.map((g) => {
        const { vertProperties, triVerts } = geometry2mesh(g.geometry)
        const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
        mesh.merge()
        return new Manifold(mesh)
      })

      let lidResult = manifolds[lid001Index]
      for (const lid002 of lid002Manifolds) {
        lidResult = Manifold.union(lidResult!, lid002)
      }

      // boxの処理
      const box001Index = bentoGeometries.findIndex((g) => g.label === "box001")
      const box002Index = bentoGeometries.findIndex((g) => g.label === "box002")
      const box003Manifolds = bentoGeometries
        .filter((g) => g.label === "box003")
        .map((g) => {
          const { vertProperties, triVerts } = geometry2mesh(g.geometry)
          const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
          mesh.merge()
          return new Manifold(mesh)
        })

      let boxResult = manifolds[box001Index]
      boxResult = Manifold.difference(boxResult!, manifolds[box002Index]!)
      for (const box003 of box003Manifolds) {
        boxResult = Manifold.union(boxResult, box003)
      }

      // latchのジオメトリを取得
      const latchGeometry = bentoGeometries.find(g => g.label === "latch")?.geometry

      return [
        {
          label: "tray",
          id: "tray",
          geometry: mesh2geometry(trayResult!.getMesh())
        },
        {
          label: "lid",
          id: "lid",
          geometry: mesh2geometry(lidResult!.getMesh())
        },
        {
          label: "box",
          id: "box",
          geometry: mesh2geometry(boxResult.getMesh())
        },
        ...(latchGeometry ? [{
          label: "latch",
          id: "latch",
          geometry: latchGeometry
        }] : [])
      ]
    } catch (error) {
      console.error("Error processing geometry:", error)
      return null
    }
  }, [geometriesWithInfo, manifoldModule, slug])

  const parseMesh = useCallback(
    async (object: Object3D) => {
      switch (format) {
        case "stl": {
          return new STLExporter().parse(object)
        }
      }
      return null
    },
    [format]
  )

  const handleExportSingle = useCallback(
    async (index: number) => {
      if (!format || !geometriesWithInfo[index]) return

      const { id, geometry, label } = geometriesWithInfo[index]
      // IDを含めたファイル名にする - IDは文字列として扱う

      if (format === "json") {
        await showSaveFilePicker({
          generator: () => Promise.resolve(JSON.stringify(geometry)),
          suggestedName: `${label}-W${totalWidth}-D${totalDepth}-H${totalHeight}.${format}`,
          types: [
            {
              description: `${format?.toUpperCase()} file`,
              accept: {
                "application/octet-stream": [`.${format}`],
              },
            },
          ],
        })
      } else {
        await showSaveFilePicker({
          generator: async () => {
            const mesh = new ThreeMesh(
              geometry.clone(),
              new MeshStandardMaterial({
                side: DoubleSide,
              })
            )

            const root = new Object3D()
            root.add(mesh)

            const data = await parseMesh(root)
            return data
          },
          suggestedName: `${label}-W${totalWidth}-D${totalDepth}-H${totalHeight}.${format}`,
          types: [
            {
              description: `${format?.toUpperCase()} file`,
              accept: {
                "application/octet-stream": [`.${format}`],
              },
            },
          ],
        })
      }
    },
    [format, geometries, parseMesh]
  )
  useEffect(() => {
    const initManifold = async () => {
      const wasm = await Module()
      wasm.setup()
      setManifoldModule(wasm)
    }
    initManifold()
  }, [])
  useEffect(() => {
    console.log("geometries", geometries)
  }, [geometries])
  //processTrayGeometry内でmanifoldGeometriesを更新してはいけないのでuseEffectで実行
  useEffect(() => {
    console.log("processBentoGeometry", processBentoGeometry)
    if (slug === "tray") {
      if (processTrayGeometry) {
        //同じtrayのlabelを持ったmanifoldGeometriesは削除
        //bento3dに関連するジオメトリを削除
        const newManifoldGeometries = manifoldGeometries.filter(
          (geometry) =>
            !["tray", "lid", "box", "latch"].includes(geometry.label)
        )
        setManifoldGeometries([
          ...newManifoldGeometries,
          {
            label: "tray",
            id: "tray",
            geometry: processTrayGeometry,
          },
        ])
      }
    }
    if (slug === "bento3d") {
      if (processBentoGeometry) {
        //bento3dに関連するジオメトリを削除
        const newManifoldGeometries = manifoldGeometries.filter(
          (geometry) => !["tray", "lid", "box", "latch"].includes(geometry.label)
        )
        setManifoldGeometries([
          ...newManifoldGeometries,
          ...processBentoGeometry
        ])
      }
    }
  }, [slug, processTrayGeometry, processBentoGeometry])

  return (
    <div className="p-0">
      {manifoldGeometries.length > 0 ? (
        <ul className={`grid grid-cols-1 w-full ${gridCSS(slug!)} gap-2`}>
          {manifoldGeometries.map((geometry) => (
            <li
              key={geometry.id}
              onClick={async () => {
                const mesh = new ThreeMesh(
                  geometry.geometry,
                  new MeshStandardMaterial({ side: DoubleSide })
                )
                const root = new Object3D()
                root.add(mesh)
                const exporter = new STLExporter()
                const data = exporter.parse(root)
                const blob = new Blob([data], {
                  type: "application/octet-stream",
                })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `${geometry.label}_W${totalWidth}xD${totalDepth}xH${totalHeight}.stl`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex justify-between items-center p-2 flex-col gap-1 cursor-pointer rounded-md hover:bg-surface-sheet-m transition">
              <Icon
                name={geometry.label || "bento-box"}
                className="stroke-[2px] stroke-content-m size-2/3"
              />
              <button className="b-button bg-surface-ev1 !text-white items-center !py-1 w-full justify-center hover:!bg-content-h-a">
                <Icon name="download" className="size-4" />
                {geometry.label}
              </button>
            </li>
            ))}
        </ul>
      ) : (
        <div className="bg-system-error-l flex flex-col items-center justify-center p-2 rounded-md w-full text-system-error-h">
          <div className="flex items-start gap-1 justify-start">
            <Icon name="alert" className="size-6" />
            <h3 className="text-base leading-tight mb-2 font-bold ">
              Failed to generate geometry
            </h3>
          </div>
          <p className="text-xs ml-6">Try changing W/D/H size or partition</p>
        </div>
      )}
      {manifoldGeometries.length === 0 && (
        <div className="bg-system-error-l flex flex-col items-center justify-center p-2 rounded-md w-full text-system-error-h">
          <div className="flex items-start gap-1 justify-start">
            <Icon name="alert" className="size-6" />
            <h3 className="text-base leading-tight mb-2 font-bold ">
              Failed to generate geometry
            </h3>
          </div>
          <p className="text-xs ml-6">Try changing W/D/H size or partition</p>
        </div>
      )}
    </div>
  )
}

export default GeometryExporter
