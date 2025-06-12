import Canvas from "@/components/frame/3d/Canvas"

import { useModularStore } from "@/stores/modular"
import { useFrameStore } from "@/stores/frame"
import { useCallback } from "react"
import { useSettingsStore } from "@/stores/settings"


export function Page() {
  
  const frameState = useFrameStore()
  const { setIsPreviewLoad } = useSettingsStore((state) => state)
  const { inputNodeId, updateNodeProperty } = useModularStore((state) => state)

  

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

  return (
    <>
      <Canvas />
    </>
  )
}
