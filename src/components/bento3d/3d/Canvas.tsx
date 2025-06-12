import { Canvas as ThreeCanvas, useFrame, useThree } from "@react-three/fiber"
import {
  OrbitControls,
  GizmoViewport,
  GizmoHelper,
  Grid,
} from "@react-three/drei"

import { useModularStore } from "@/stores/modular"
import TrayModel from "./TrayModel"
import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react"
import { Object3D } from "three"
import PreviewModel from "./PreviewModel"
import { useNavigationStore } from "@/stores/navigation"
import { useSettingsStore } from "@/stores/settings"
import useConversion from "@/hooks/useConversion"
import * as THREE from "three"
import { animate, MotionValue, useMotionValue } from "framer-motion"

const Canvas = () => {
  const { geometries } = useModularStore()
  const { currentNav } = useNavigationStore((state) => state)
  const { gridSize, cameraMode } = useSettingsStore((state) => state)
  const { deunit } = useConversion()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const cameraX = useMotionValue(300)
  const cameraY = useMotionValue(300)
  const cameraZ = useMotionValue(300)
  useLayoutEffect(() => {
    if (cameraMode === "perspective") {
      animate(cameraX, 300, { duration: 0.2 })
      animate(cameraY, -300, { duration: 0.2 })
      animate(cameraZ, 300, { duration: 0.2 })
    } else if (cameraMode === "front") {
      //Front View
      animate(cameraX, 0, { duration: 0.2 })
      animate(cameraY, -300, { duration: 0.2 })
      animate(cameraZ, 0, { duration: 0.2 })
    } else if (cameraMode === "side") {
      //SideView
      animate(cameraX, 300, { duration: 0.2 })
      animate(cameraY, 0, { duration: 0.2 })
      animate(cameraZ, 0, { duration: 0.2 })
    }
  }, [cameraMode])
  const CameraPositionUpdater = ({
    x,
    y,
    z,
  }: {
    x: MotionValue
    y: MotionValue
    z: MotionValue
  }) => {
    const { camera } = useThree()

    useFrame(() => {
      if (currentNav == 0) {
        camera.position.x = x.get()
        camera.position.y = y.get()
        camera.position.z = z.get()

        camera.updateProjectionMatrix()
      }
    })

    return null
  }

  useEffect(() => {
    Object3D.DEFAULT_UP.set(0, 0, 1) //Z軸を上にする
  }, [])

  useEffect(() => {
    // リサイズハンドラー関数
    const handleResize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        })
      }
    }

    // 初期サイズを設定
    handleResize()

    // リサイズイベントリスナーを追加
    window.addEventListener("resize", handleResize)

    // クリーンアップ関数
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="flex-1" ref={canvasRef}>
      <ThreeCanvas
        orthographic
        camera={{
          // position: [100, -100, 100], // clipping 問題解決するため zを１００にする
          position: [cameraX.get(), cameraY.get(), cameraZ.get()],
          fov: 40,
          zoom: 5,
          near: 0.1,
          far: 10000,
        }}
        frameloop="demand"
        resize={{ scroll: false, debounce: { scroll: 50, resize: 50 } }}>
        <CameraPositionUpdater x={cameraX} y={cameraY} z={cameraZ} />
        <color attach="background" args={["#cccccc"]} />
        <Grid
          cellSize={deunit(gridSize)}
          sectionSize={deunit(gridSize) * 10}
          sectionColor={"#9fc0b7"}
          cellColor={"#919c9b"}
          cellThickness={0.8}
          sectionThickness={0.8}
          fadeDistance={800}
          rotation={[Math.PI / 2, 0, 0]}
          infiniteGrid={true}
          side={THREE.DoubleSide}
        />
        <ambientLight intensity={2.5} />
        {/* axis helper */}

        {/* <axesHelper args={[100]} /> */}
        <directionalLight
          position={[50, 50, 50]}
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
          enablePan={false}
          enableZoom={true}
          enableRotate={currentNav === 2 ? true : false}
          makeDefault
          dampingFactor={0.3}
        />

        {currentNav == 0 && <PreviewModel />}
        {currentNav == 2 && <TrayModel />}
      </ThreeCanvas>
    </div>
  )
}

export default Canvas
