import Canvas from "@/components/nozzle/3d/Canvas"

import { PropertyPanel } from "@/components/nozzle/ui/PropertyPanel"



export function Page() {
  return (
    <>
      <PropertyPanel />
      {/* <div className="absolute inset-0  z-10 pointer-events-none">
        <RangeSlider
          min={0}
          max={1}
          step={0.1}
          label={"holeSize"}
          position={"bottom"}
        />
        <RangeSlider 
          min={3} 
          max={10} 
          step={0.1}
          label={"nozzleSize"} 
          position={"right"} 
        />
      </div> */}
      <Canvas />
    </>
  )
}
