import Canvas from "@/components/bento3d/3d/Canvas"
import DialogAd from "@/components/common/ui/DialogAd"
import DialogFeedback from "@/components/common/ui/DialogFeedback"
import DrawerUpdates from "@/components/common/ui/DrawerUpdates"

import { GridEditor } from "@/components/common/ui/GridEditor"
import { Header } from "@/components/common/ui/Header"
import Icon from "@/components/common/ui/Icon"
import { LeftMenu } from "@/components/common/ui/LeftMenu"
import { RightMenu } from "@/components/common/ui/RightMenu"
import { RangeSlider } from "@/components/common/ui/Slider"
import { useModularStore } from "@/stores/modular"
import { useNavigationStore } from "@/stores/navigation"
import { useSettingsStore } from "@/stores/settings"
import { Toast } from "@/components/common/ui/Toast"
import { useTrayStore } from "@/stores/tray"
import { useCallback } from "react"
import { ColorSwitcher } from "@/components/common/ui/ColorSwicher"

export function Page() {
  const { currentNav } = useNavigationStore()
  const trayState = useTrayStore()
  const { thickness } = useTrayStore((state) => state)
  const { inputNodeId, updateNodeProperty } = useModularStore((state) => state)
  const { setBom, setIsPreviewLoad } = useSettingsStore((state) => state)

  const handleDLView = useCallback(() => {
    console.log("trayStore state:", trayState)
    if (!inputNodeId) return

    try {
      updateNodeProperty(
        inputNodeId!,
        `{"trayStore":${JSON.stringify(trayState)}}`
      )
    } finally {
      // 少し遅延を入れてUIの更新が完了するのを待つ
      setTimeout(() => {
        console.log("done")
        setIsPreviewLoad(false)
      }, 300)
    }
  }, [inputNodeId, trayState])

  return (
    <>
      <Canvas />
      {/* UI実装など */}
      <Header onClickDL={handleDLView} />
      {/* UIコンポーネントだけを条件付きで表示 */}
      {currentNav == 0 && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <RangeSlider min={50} max={400} label={"width"} position={"bottom"} />
          <RangeSlider
            min={thickness}
            max={200}
            label={"height"}
            position={"right"}
          />
          <RangeSlider min={30} max={400} label={"depth"} position={"left"} />
        </div>
      )}

      {currentNav == 1 && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center justify-center w-1/2 h-1/2">
            <GridEditor />
          </div>
        </div>
      )}
      {currentNav == 2 && (
        // <input
        //   className="absolute bottom-16 right-16 w-1/2 h-1/2 z-10"
        //   type="range"
        //   step={0.01}
        //   min={0}
        //   max={1}
        //   onChange={(e) => setBom(Number(e.target.value))}
        // />
        // <div className="b-input absolute z-10 bottom-32 inset-x-0 flex justify-center items-center gap-2 pointer-events-none text-white">
        //   <Icon name="bom-shrink" className="size-8" />

        //   <input
        //     type="range"
        //     min={0}
        //     max={1}
        //     step={0.01}
        //     defaultValue={0}
        //     onChange={(e) => setBom(Number(e.target.value))}
        //   />

        //   <Icon name="bom-explode" className="size-8" />
        // </div>
        <div className="absolute bottom-8 inset-x-0 flex justify-center items-center gap-2 pointer-events-none text-white">
          <ColorSwitcher />
        </div>
      )}
      <LeftMenu />
      <RightMenu />
      <DialogAd />
      <DialogFeedback />
      <DrawerUpdates />
      <Toast />
      {/* <div className="absolute bottom-16 right-16">
        <GeometryExporter />
      </div> */}
    </>
  )
}
