import Canvas from "@/components/nozzle/3d/Canvas"

import { useModularStore } from "@/stores/modular"
import { usenozzleStore } from "@/stores/nozzle"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSettingsStore } from "@/stores/settings"
import { useParams } from "react-router-dom"
import Module from "manifold-3d"
import { geometry2mesh, mesh2geometry } from "@/utils/geometryUtils"
import { PropertyPanel } from "@/components/nozzle/ui/PropertyPanel"
import { BufferGeometry } from "three"
import { RangeSlider } from "@/components/nozzle/ui/Slider"


export function Page() {
  const nozzleState = usenozzleStore()
  const { setIsPreviewLoad } = useSettingsStore((state) => state)
  const { inputNodeId, updateNodeProperty, geometries } = useModularStore(
    (state) => state
  )
  const { updatenozzle } = usenozzleStore((state) => state)
  const { slug } = useParams<{ slug: string }>()
  const [manifoldModule, setManifoldModule] = useState<Awaited<
    ReturnType<typeof Module>
  > | null>(null)
  const { manifoldGeometries, setManifoldGeometries } = useModularStore(
    (state) => state
  )

  const handleDLView = useCallback(() => {
    console.log("nozzleStore state:", nozzleState)
    if (!inputNodeId) return

    try {
      updateNodeProperty(
        inputNodeId!,
        `{"nozzleStore":${JSON.stringify(nozzleState)}}`
      )
    } finally {
      // 少し遅延を入れてUIの更新が完了するのを待つ
      setTimeout(() => {
        console.log("done")
        setIsPreviewLoad(false)
        
      }, 300)
    }
  }, [inputNodeId, nozzleState])

  const processGeometries = useMemo(() => {
    if (!manifoldModule || slug !== "nozzle") return null

    const { Manifold, Mesh } = manifoldModule
    const nozzleGeometries = geometries
      .filter((geometry) =>
        ["nozzle"].some((key) => geometry.label?.includes(key))
      )
      .sort((a, b) => {
        const numA = parseInt(a.label?.match(/\d+/)?.[0] || "0")
        const numB = parseInt(b.label?.match(/\d+/)?.[0] || "0")
        return numA - numB
      })
    console.log("nozzleGeometries", nozzleGeometries)
    if (nozzleGeometries.length < 2) return null

    try {
      const manifolds = nozzleGeometries.map((geometry) => {
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

      // nozzleの処理
      const nozzle001Index = nozzleGeometries.findIndex(
        (g) => g.label === "nozzle001"
      )
      const nozzle002s = nozzleGeometries.filter((g) => g.label === "nozzle002")
      const nozzle002Manifolds = nozzle002s.map((g) => {
        const { vertProperties, triVerts } = geometry2mesh(g.geometry)
        const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
        mesh.merge()
        return new Manifold(mesh)
      })

      let nozzleResult = manifolds[nozzle001Index]
      for (const nozzle002 of nozzle002Manifolds) {
        nozzleResult = Manifold.difference(nozzleResult!, nozzle002)
      }
      // backBoardの処理
      const backBoard001Index = nozzleGeometries.findIndex(
        (g) => g.label === "backBoard001"
      )
      const backBoard003Index = nozzleGeometries.findIndex(
        (g) => g.label === "backBoard003"
      )
      const backBoard002s = nozzleGeometries.filter(
        (g) => g.label === "backBoard002"
      )
      const backBoard002Manifolds = backBoard002s.map((g) => {
        const { vertProperties, triVerts } = geometry2mesh(g.geometry)
        const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
        mesh.merge()
        return new Manifold(mesh)
      })

      let backBoardResult = manifolds[backBoard001Index]
      for (const backBoard002 of backBoard002Manifolds) {
        backBoardResult = Manifold.union(backBoardResult!, backBoard002)
      }

      backBoardResult = Manifold.difference(
        backBoardResult!,
        manifolds[backBoard003Index]!
      )

      // screwのジオメトリを取得
      const screwGeometry = nozzleGeometries.find(
        (g) => g.label === "screw"
      )?.geometry
      // standのジオメトリを取得
      const standGeometries = nozzleGeometries.filter(
        (g) => g.label === "stand"
      ).map(g => g.geometry)

      return [
        {
          label: "nozzle",
          id: "nozzle",
          geometry: mesh2geometry(nozzleResult!.getMesh()),
        },
        {
          label: "backBoard",
          id: "backBoard",
          geometry: mesh2geometry(backBoardResult!.getMesh()),
        },
        {
          label: "screw",
          id: "screw",
          geometry: screwGeometry,
        },
        ...standGeometries.map((geometry, i) => ({
          label: "stand",
          id: `stand${i + 1}`,
          geometry,
        })),
      ]
    } catch (error) {
      console.error("Error processing geometry:", error)
      return null
    }
  }, [manifoldModule, slug, geometries])

  //processTrayGeometry内でmanifoldGeometriesを更新してはいけないのでuseEffectで実行
  useEffect(() => {
    if (slug === "nozzle" && processGeometries) {
      setManifoldGeometries(
        processGeometries.filter(
          (g): g is { label: string; id: string; geometry: BufferGeometry } => g.geometry !== undefined
        )
      )
    }
  }, [slug, processGeometries])

  useEffect(() => {
    const initManifold = async () => {
      const wasm = await Module()
      wasm.setup()
      setManifoldModule(wasm)
    }
    initManifold()
  }, [])
  

  return (
    <>
      
      <PropertyPanel />
      <div className="absolute inset-0  z-10 pointer-events-none">
      <RangeSlider min={30} max={180} label={"width"} position={"bottom"} />
      <RangeSlider min={30} max={180} label={"height"} position={"right"} />
      </div>
      <Canvas />
    </>
  )
}
