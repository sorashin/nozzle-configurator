import Canvas from "@/components/frame/3d/Canvas"

import { useModularStore } from "@/stores/modular"
import { useFrameStore } from "@/stores/frame"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSettingsStore } from "@/stores/settings"
import { useParams } from "react-router-dom"
import Module from "manifold-3d"
import { geometry2mesh, mesh2geometry } from "@/utils/geometryUtils"
import { PropertyPanel } from "@/components/frame/ui/PropertyPanel"
import { BufferGeometry } from "three"
import { RangeSlider } from "@/components/frame/ui/Slider"


export function Page() {
  const frameState = useFrameStore()
  const { setIsPreviewLoad } = useSettingsStore((state) => state)
  const { inputNodeId, updateNodeProperty, geometries } = useModularStore(
    (state) => state
  )
  const { updateFrame } = useFrameStore((state) => state)
  const { slug } = useParams<{ slug: string }>()
  const [manifoldModule, setManifoldModule] = useState<Awaited<
    ReturnType<typeof Module>
  > | null>(null)
  const { manifoldGeometries, setManifoldGeometries } = useModularStore(
    (state) => state
  )

  const handleDLView = useCallback(() => {
    console.log("frameStore state:", frameState)
    if (!inputNodeId) return

    try {
      updateNodeProperty(
        inputNodeId!,
        `{"frameStore":${JSON.stringify(frameState)}}`
      )
    } finally {
      // 少し遅延を入れてUIの更新が完了するのを待つ
      setTimeout(() => {
        console.log("done")
        setIsPreviewLoad(false)
        
      }, 300)
    }
  }, [inputNodeId, frameState])

  const processGeometries = useMemo(() => {
    if (!manifoldModule || slug !== "frame") return null

    const { Manifold, Mesh } = manifoldModule
    const frameGeometries = geometries
      .filter((geometry) =>
        ["frame","screw","backBoard","stand"].some((key) => geometry.label?.includes(key))
      )
      .sort((a, b) => {
        const numA = parseInt(a.label?.match(/\d+/)?.[0] || "0")
        const numB = parseInt(b.label?.match(/\d+/)?.[0] || "0")
        return numA - numB
      })
    console.log("frameGeometries", frameGeometries)
    if (frameGeometries.length < 2) return null

    try {
      const manifolds = frameGeometries.map((geometry) => {
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

      // frameの処理
      const frame001Index = frameGeometries.findIndex(
        (g) => g.label === "frame001"
      )
      const frame002s = frameGeometries.filter((g) => g.label === "frame002")
      const frame002Manifolds = frame002s.map((g) => {
        const { vertProperties, triVerts } = geometry2mesh(g.geometry)
        const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
        mesh.merge()
        return new Manifold(mesh)
      })

      let frameResult = manifolds[frame001Index]
      for (const frame002 of frame002Manifolds) {
        frameResult = Manifold.difference(frameResult!, frame002)
      }
      // backBoardの処理
      const backBoard001Index = frameGeometries.findIndex(
        (g) => g.label === "backBoard001"
      )
      const backBoard003Index = frameGeometries.findIndex(
        (g) => g.label === "backBoard003"
      )
      const backBoard002s = frameGeometries.filter(
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
      const screwGeometry = frameGeometries.find(
        (g) => g.label === "screw"
      )?.geometry
      // standのジオメトリを取得
      const standGeometries = frameGeometries.filter(
        (g) => g.label === "stand"
      ).map(g => g.geometry)

      return [
        {
          label: "frame",
          id: "frame",
          geometry: mesh2geometry(frameResult!.getMesh()),
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
    if (slug === "frame" && processGeometries) {
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
