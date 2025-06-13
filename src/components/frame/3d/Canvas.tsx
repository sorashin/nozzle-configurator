import { Canvas as ThreeCanvas } from "@react-three/fiber"
import { OrbitControls, GizmoViewport, GizmoHelper, Stage, Box } from "@react-three/drei"

import { useModularStore } from "@/stores/modular"
import Model from "./Model"
import { useCallback, useEffect } from "react"
import { Object3D } from "three"
import { Board } from "./elements/Board"

const Canvas = () => {
  
  const { manifoldGeometries } = useModularStore((state) => state)
  const renderGeometries = useCallback(() => {
    
    return manifoldGeometries.map((geometry) => {
      return geometry.geometry
    })
  }, [manifoldGeometries])
  
  return (
    <div className="flex-1">
      <ThreeCanvas
        orthographic
        camera={{
          position: [0,0, 1000], // clipping 問題解決するため zを１００にする
          fov: 40,
          zoom: 10,
          near: 0.01,
          far: 100000,
        }}
        frameloop="demand">
        {/* <color attach="background" args={["#1e293b"]} /> */}
        <ambientLight intensity={1.8} />
        <directionalLight
          position={[50, 50, 50]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <color attach="background" args={["#d9d9d9"]} />
        <GizmoHelper margin={[50, 100]} alignment="bottom-right" scale={0.5}>
          <GizmoViewport
            axisColors={["hotpink", "aquamarine", "#3498DB"]}
            labelColor="black"
          />
        </GizmoHelper>

        {/* <OrbitControls
          enableRotate={true}
          enablePan={true}
          enableZoom={true}
          zoomSpeed={0.5}
        /> */}
        <Board position={[0,0,-15]} scale={10} rotation={[0,Math.PI/2,0]}/>
        
        <Stage
          intensity={0.5}
          preset="rembrandt"
          adjustCamera={1.2}
          scale={0.5}
          shadows="contact"
          environment="city">
          <Model geometries={renderGeometries()} />
        </Stage>
      </ThreeCanvas>
    </div>
  )
}

export default Canvas
