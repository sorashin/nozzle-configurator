import { Canvas as ThreeCanvas } from "@react-three/fiber"
import { OrbitControls, GizmoViewport, GizmoHelper, Stage } from "@react-three/drei"

import { useModularStore } from "@/stores/modular"
import Model from "./Model"
import { useCallback, useEffect } from "react"
import { Object3D } from "three"

const Canvas = () => {
  
  const { manifoldGeometries } = useModularStore((state) => state)
  const renderGeometries = useCallback(() => {
    
    return manifoldGeometries.map((geometry) => {
      return geometry.geometry
    })
  }, [manifoldGeometries])
  useEffect(() => {
    Object3D.DEFAULT_UP.set(0, 0, 1) //Z軸を上にする
  }, [])
  return (
    <div className="flex-1">
      <ThreeCanvas
        orthographic
        camera={{
          position: [100, 100, 100], // clipping 問題解決するため zを１００にする
          fov: 40,
          zoom: 10,
          near: 0.1,
          far: 10000,
        }}
        frameloop="demand">
        {/* <color attach="background" args={["#1e293b"]} /> */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <GizmoHelper margin={[50, 100]} alignment="bottom-right" scale={0.5}>
          <GizmoViewport
            axisColors={["hotpink", "aquamarine", "#3498DB"]}
            labelColor="black"
          />
        </GizmoHelper>

        <OrbitControls
          enableRotate={true}
          enablePan={true}
          enableZoom={true}
          zoomSpeed={0.5}
        />
        <gridHelper
          args={[100, 100, "#555555", "#444444"]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Stage
          
          intensity={0.5}
          preset="rembrandt"
          adjustCamera
          shadows="contact"
          environment="city">
          <Model geometries={renderGeometries()} />
        </Stage>
      </ThreeCanvas>
    </div>
  )
}

export default Canvas
