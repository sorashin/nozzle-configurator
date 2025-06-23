import Canvas from "@/components/nozzle/3d/Canvas"

import { useModularStore } from "@/stores/modular"
import { useNozzleStore } from "@/stores/nozzle"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSettingsStore } from "@/stores/settings"
import { useParams } from "react-router-dom"
import Module from "manifold-3d"
import { geometry2mesh, mesh2geometry } from "@/utils/geometryUtils"
import { PropertyPanel } from "@/components/nozzle/ui/PropertyPanel"
import { BufferGeometry } from "three"
import { RangeSlider } from "@/components/nozzle/ui/Slider"


export function Page() {
  const nozzleState = useNozzleStore()
  const { setIsPreviewLoad } = useSettingsStore((state) => state)
  const { inputNodeId, nodeIds, updateNodeProperty, geometries } = useModularStore(
    (state) => state
  )

  
  

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
