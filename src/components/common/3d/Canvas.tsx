import { Canvas as ThreeCanvas } from "@react-three/fiber"
import { OrbitControls, GizmoViewport, GizmoHelper } from "@react-three/drei"

import { useModularStore } from "@/stores/modular"
import Model from "./Model"
import { useEffect } from "react"
import { Object3D } from "three"

const Canvas = () => {
  const { geometries } = useModularStore()
  const renderGeometries = () => {
    return geometries.map((geometry) => {
      return geometry.geometry
    })
  }
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
        <Model geometries={renderGeometries()} />
      </ThreeCanvas>
    </div>
  )
}

export default Canvas
