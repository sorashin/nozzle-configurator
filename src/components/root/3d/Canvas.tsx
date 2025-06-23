import { Canvas as ThreeCanvas } from "@react-three/fiber"
import { OrbitControls, GizmoViewport, GizmoHelper, Environment, Stage } from "@react-three/drei"


const Canvas = () => {
  

  
  return (
    <div className="flex-1">
      <ThreeCanvas
        camera={{
          position: [0, 0, 100],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        frameloop="demand">
        <ambientLight intensity={1.8} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={1}
          castShadow={false}
        />
        <Environment preset="studio" />
        <color attach="background" args={["#d9d9d9"]} />
        {/* <fog attach="fog" args={["#d9d9d9", 400, 1000]} /> */}
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
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI * 2/3}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
          maxDistance={900} // カメラの最大ズームアウト距離を200に制限
        />
        <Stage
          intensity={0}
          preset="rembrandt"
          adjustCamera={2}
          scale={1}
          shadows={false}>
          
        </Stage>
      </ThreeCanvas>
    </div>
  )
}

export default Canvas
