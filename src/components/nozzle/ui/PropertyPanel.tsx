import React from "react"

import { Tooltip } from "react-tooltip"
import { motion } from "framer-motion"

import {  useModularStore } from "@/stores/modular"
import { useNozzleStore } from "@/stores/nozzle"



export const PropertyPanel: React.FC = () => {
  const {updateNodeProperty,nodeIds} = useModularStore()
  const {holeSize,nozzleSize,updateNozzle} = useNozzleStore()
  

  return (
    <>
      <motion.div
        className={`absolute h-auto top-8 left-8 w-full md:w-[240px] py-2 z-20 bg-surface-sheet-l rounded-md backdrop-blur-sm flex flex-col gap-2 items-center justify-center`}
        layout>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={holeSize}
          onChange={(e) => {
            updateNozzle({holeSize:Number(e.target.value)})
            updateNodeProperty(nodeIds.holeSize, Number(e.target.value))
          }}
        />
        <br />
        <input
          type="range"
          min={3}
          max={5}
          step={0.1}
          value={nozzleSize}
          onChange={(e) => {
            updateNozzle({ nozzleSize: Number(e.target.value) })
            updateNodeProperty(nodeIds.nozzleSize, Number(e.target.value))
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
