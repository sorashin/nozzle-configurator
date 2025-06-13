import React from "react"

import { Tooltip } from "react-tooltip"
import { motion } from "framer-motion"
import { STLExporter } from "three-stdlib"
import { ManifoldGeometriesWithInfo, useModularStore } from "@/stores/modular"
import {
  DoubleSide,
  MeshStandardMaterial,
  Object3D,
  Mesh as ThreeMesh,
} from "three"
import { useFrameStore } from "@/stores/frame"


export const PropertyPanel: React.FC = () => {
  const {manifoldGeometries} = useModularStore()
  const {width,height} = useFrameStore((state) => state)
  const handleDownload = (geometry:ManifoldGeometriesWithInfo) => {
    const mesh = new ThreeMesh(
      geometry.geometry,
      new MeshStandardMaterial({ side: DoubleSide })
    )
    const root = new Object3D()
    root.add(mesh)
    const exporter = new STLExporter()
    const data = exporter.parse(root)
    const blob = new Blob([data], {
      type: "application/octet-stream",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${geometry.label}_W${width}xH${height}.stl`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <motion.div
        className={`absolute h-auto top-8 right-8 w-full md:w-[240px] py-2 z-20 bg-surface-sheet-l rounded-md backdrop-blur-sm flex flex-col gap-2 items-center justify-center`}
        layout>
        <motion.div
          className="pt-2 px-2 border-t-[0.5px] border-content-xl-a w-full"
          layout>
          <p className="w-full my-2 text-center text-xs text-content-m-a font-display">
            Download STLs
          </p>

          {manifoldGeometries.length>0&&manifoldGeometries.map((manifold) => (
            <div key={manifold.id}>
              <button className="b-button" onClick={() => handleDownload(manifold)}>{manifold.label}</button>
            </div>
          ))}
        </motion.div>

        

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
