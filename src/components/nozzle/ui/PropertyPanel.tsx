import React, { useEffect } from "react"

import { Tooltip } from "react-tooltip"
import { motion } from "framer-motion"

import {  useModularStore } from "@/stores/modular"
import { useNozzleStore } from "@/stores/nozzle"



export const PropertyPanel: React.FC = () => {
  const {updateNodeProperty,nodeIds} = useModularStore()
  const {holeSize,nozzleSize,updateNozzle} = useNozzleStore()
  
  useEffect(()=>{
    if (nodeIds.holeSize&&nodeIds.nozzleSize){
      updateNodeProperty(nodeIds.holeSize, holeSize)
      updateNodeProperty(nodeIds.nozzleSize, nozzleSize)
    }
  },[holeSize,nozzleSize])  

  return (
    <>
      <motion.div
        className={`absolute h-auto top-8 left-8 w-full md:w-[240px] py-2 z-20 bg-surface-sheet-l rounded-md backdrop-blur-sm flex flex-col gap-2 items-center justify-center`}
        layout>
        <label htmlFor="material">材質</label>
        
        <label htmlFor="length">全長</label>
        <input type="text" id="length" />
        <label htmlFor="maxOuterDiameter">最大外径</label>
        <input type="text" id="maxOuterDiameter" />
        <label htmlFor="tipInnerDiameter">先端部内径</label>
        <input type="text" id="tipInnerDiameter" />
        <label htmlFor="tipOuterDiameter">先端部外径</label>
        <input type="text" id="tipOuterDiameter" />
        <label htmlFor="tipNeedleLength">先端針長さ</label>
        <input type="text" id="tipNeedleLength" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={holeSize}
          onChange={(e) => {
            updateNozzle({holeSize:Number(e.target.value)})
            // updateNodeProperty(nodeIds.holeSize, Number(e.target.value))
          }}
        />
        <br />
        <input
          type="range"
          min={4}
          max={7}
          step={0.1}
          value={nozzleSize}
          onChange={(e) => {
            updateNozzle({ nozzleSize: Number(e.target.value) })
            // updateNodeProperty(nodeIds.nozzleSize, Number(e.target.value))
          }}
        />

        <Tooltip
          id="hint-tooltip"
          place="bottom"
          className="text-xs"
          style={{
            backgroundColor: "#1C1C1C",
            color: "#ffffff",
            fontSize: "12px",
            padding: "2px 4px 2px 4px",
            borderRadius: "4px",
            userSelect: "none",
          }}
          noArrow
        />
      </motion.div>
    </>
  )
}
