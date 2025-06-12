import Canvas from "@/components/frame/3d/Canvas"

import { useModularStore } from "@/stores/modular"
import { useFrameStore } from "@/stores/frame"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSettingsStore } from "@/stores/settings"
import { useParams } from "react-router-dom"
import Module from "manifold-3d"
import { geometry2mesh, mesh2geometry } from "@/utils/geometryUtils"


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
        ["frame"].some((key) => geometry.label?.includes(key))
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

      

      // // latchのジオメトリを取得
      // const latchGeometry = frameGeometries.find(
      //   (g) => g.label === "latch"
      // )?.geometry

      return [
        {
          label: "frame",
          id: "frame",
          geometry: mesh2geometry(frameResult!.getMesh()),
        },
        // ...(latchGeometry
        //   ? [
        //       {
        //         label: "latch",
        //         id: "latch",
        //         geometry: latchGeometry,
        //       },
        //     ]
        //   : []),
      ]
    } catch (error) {
      console.error("Error processing geometry:", error)
      return null
    }
  }, [frameState, geometries])

  //processTrayGeometry内でmanifoldGeometriesを更新してはいけないのでuseEffectで実行
  useEffect(() => {
    
    
    if (slug === "frame") {
      if (processGeometries) {
        //bento3dに関連するジオメトリを削除
        const newManifoldGeometries = manifoldGeometries.filter(
          (geometry) =>
            !["frame", "lid", "box", "latch"].includes(geometry.label)
        )
        setManifoldGeometries([
          ...newManifoldGeometries,
          ...processGeometries,
        ])
      }
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
      <input
        className="absolute bottom-8 left-8 z-10"
        type="range"
        min={10}
        max={200}
        value={frameState.width}
        onChange={(e) => updateFrame({ width: Number(e.target.value) })}
        onMouseUp={handleDLView}
        onTouchEnd={handleDLView}
      />
      <Canvas />
    </>
  )
}
