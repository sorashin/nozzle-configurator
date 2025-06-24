import React, { useEffect } from "react"

import { Tooltip } from "react-tooltip"
import { motion } from "framer-motion"

import {  useModularStore } from "@/stores/modular"
import { Material, useNozzleStore } from "@/stores/nozzle"



export const PropertyPanel: React.FC = () => {
  const {updateNodeProperty,nodeIds} = useModularStore()
  const {length,outerSize,tipInnerSize,tipOuterSize,needleLength,updateNozzle,material} = useNozzleStore()
  
  useEffect(()=>{
    if (nodeIds.length&&nodeIds.outerSize&&nodeIds.tipInnerSize&&nodeIds.tipOuterSize&&nodeIds.needleLength){
      updateNodeProperty(nodeIds.length, length)
      updateNodeProperty(nodeIds.outerSize, outerSize)
      updateNodeProperty(nodeIds.tipInnerSize, tipInnerSize)
      updateNodeProperty(nodeIds.tipOuterSize, tipOuterSize)
      updateNodeProperty(nodeIds.needleLength, needleLength)
    }
  },[length,outerSize,tipInnerSize,tipOuterSize,needleLength])  

  return (
    <>
      <motion.div
        className={`absolute h-auto top-8 left-8 w-full md:w-64 py-2 z-20 bg-surface-sheet-l rounded-md backdrop-blur-sm flex flex-col gap-2 items-center justify-center font-serif text-content-h-a`}
        layout>
        <div className="grid grid-cols-[minmax(0,_1.5fr)_repeat(2,_minmax(62px,_1fr))] gap-2 items-center">
          <label htmlFor="material">材質</label>
          <div className="t-tabs col-span-2 text-sm">
            <button
              className={material === "bronze" ? "t-tab-active" : ""}
              onClick={() => updateNozzle({ material: "bronze" as Material })}>
              真鍮
            </button>
            <span className="bg-transparent"></span>
            <button
              className={material === "high-wear-steel" ? "t-tab-active" : ""}
              onClick={() =>
                updateNozzle({ material: "high-wear-steel" as Material })
              }>
              高耐摩耗鋼
            </button>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,_1.5fr)_repeat(2,_minmax(62px,_1fr))] gap-2 items-center">

        <label htmlFor="length">全長</label>
        <input
          type="range"
          min={10}
          max={20}
          step={0.1}
          value={length}
          onChange={(e) => {
            updateNozzle({ length: Number(e.target.value) })
            // updateNodeProperty(nodeIds.holeSize, Number(e.target.value))
          }}
        />
        </div>
        <div className="grid grid-cols-[minmax(0,_1.5fr)_repeat(2,_minmax(62px,_1fr))] gap-2 items-center">

        <label htmlFor="maxOuterDiameter">最大外径</label>
        <input
          type="range"
          min={4}
          max={10}
          step={0.1}
          value={outerSize}
          onChange={(e) => {
            updateNozzle({ outerSize: Number(e.target.value) })
            // updateNodeProperty(nodeIds.nozzleSize, Number(e.target.value))
          }}
        />
        </div>
        <div className="grid grid-cols-[minmax(0,_1.5fr)_repeat(2,_minmax(62px,_1fr))] gap-2 items-center">

        <label htmlFor="tipInnerDiameter">先端部内径</label>
        <input
          type="range"
          min={0.1}
          max={2}
          step={0.1}
          value={tipInnerSize}
          onChange={(e) => {
            updateNozzle({ tipInnerSize: Number(e.target.value) })
            // updateNodeProperty(nodeIds.nozzleSize, Number(e.target.value))
          }}
        />
        </div>
        <div className="grid grid-cols-[minmax(0,_1.5fr)_repeat(2,_minmax(62px,_1fr))] gap-2 items-center">

        <label htmlFor="tipOuterDiameter">先端部外径</label>
        <input
          type="range"
          min={0.1}
          max={2}
          step={0.1}
          value={tipOuterSize}
          onChange={(e) => {
            updateNozzle({ tipOuterSize: Number(e.target.value) })
            // updateNodeProperty(nodeIds.nozzleSize, Number(e.target.value))
          }}
        />
        </div>
        <div className="grid grid-cols-[minmax(0,_1.5fr)_repeat(2,_minmax(62px,_1fr))] gap-2 items-center">

        <label htmlFor="tipNeedleLength">先端針長さ</label>
        <input
          type="range"
          min={0.0}
          max={10}
          step={0.1}
          value={needleLength}
          onChange={(e) => {
            updateNozzle({ needleLength: Number(e.target.value) })
            // updateNodeProperty(nodeIds.nozzleSize, Number(e.target.value))
          }}
        />
        </div>
        
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
