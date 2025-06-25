import Canvas from "@/components/nozzle/3d/Canvas"
import Icon from "@/components/nozzle/ui/Icon"

import { PropertyPanel } from "@/components/nozzle/ui/PropertyPanel"
import { useSettingsStore } from "@/stores/settings"



export function Page() {
  
  return (
    <>
      <PropertyPanel />
      {/* <div className="absolute bottom-8 inset-x-0 z-10 flex items-center justify-center">
        <button
          className={`p-2 rounded-md text-content-m-a  ${
            !isRulerOn ? "bg-transparent " : "bg-content-xxl-a "
          }`}
          onClick={() => {
            setIsRulerOn(!isRulerOn)
          }}>
          <Icon name="ruler" className="size-8" />
        </button>
      </div> */}
      <a href="https://nodi3d.com" target="_blank"
        className="absolute bottom-8 right-8 text-content-m-a text-xs flex items-center justify-center z-10 gap-2"
      >
          Powered by 
          <Icon name="nodi3d" className="h-5 w-fit"/>
      </a>
      <Canvas />
    </>
  )
}
