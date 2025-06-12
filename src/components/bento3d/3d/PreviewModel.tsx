import Dim3d from "@/components/common/3d/Dim3d"
import { useSettingsStore } from "@/stores/settings"
import { useFakeTrayStore, useTrayStore } from "@/stores/tray"
import { useMemo } from "react"
import * as THREE from "three"

// 角丸長方形を線で描画するコンポーネント
interface RoundedRectangleLineProps {
  position: [number, number, number] // [x, y, z]
  width: number
  depth: number
  fillet: number
  color?: string
  lineWidth?: number
}

function RoundedRectangleLine({
  position,
  width,
  depth,
  fillet,
  color = "#777",
  lineWidth = 1,
}: RoundedRectangleLineProps) {
  // 角丸長方形の線を表現する点を生成する
  const points = useMemo(() => {
    // フィレットは幅と高さの最小値の半分を超えないように制限する
    const radius = Math.min(fillet, Math.min(width, depth) / 2)
    const segments = 8 // 各角の円弧のセグメント数

    const [startX, startY, startZ] = position
    const adjustedZ = startZ + 1 // Z軸の位置を調整

    // 角丸長方形の点を生成
    const vertices: THREE.Vector3[] = []

    // 円弧を生成する汎用関数
    const createArc = (
      centerX: number,
      centerY: number,
      startAngle: number
    ) => {
      for (let i = 0; i <= segments; i++) {
        const theta = (Math.PI / 2) * (i / segments) + startAngle
        vertices.push(
          new THREE.Vector3(
            centerX + Math.cos(theta) * radius,
            centerY + Math.sin(theta) * radius,
            adjustedZ
          )
        )
      }
    }

    // 上辺（左から右）
    vertices.push(new THREE.Vector3(startX + radius, startY, adjustedZ))
    vertices.push(new THREE.Vector3(startX + width - radius, startY, adjustedZ))

    // 右上角の円弧
    createArc(startX + width - radius, startY + radius, -Math.PI / 2)

    // 右辺（上から下）
    vertices.push(new THREE.Vector3(startX + width, startY + radius, adjustedZ))
    vertices.push(
      new THREE.Vector3(startX + width, startY + depth - radius, adjustedZ)
    )

    // 右下角の円弧
    createArc(startX + width - radius, startY + depth - radius, 0)

    // 下辺（右から左）
    vertices.push(
      new THREE.Vector3(startX + width - radius, startY + depth, adjustedZ)
    )
    vertices.push(new THREE.Vector3(startX + radius, startY + depth, adjustedZ))

    // 左下角の円弧
    createArc(startX + radius, startY + depth - radius, Math.PI / 2)

    // 左辺（下から上）
    vertices.push(new THREE.Vector3(startX, startY + depth - radius, adjustedZ))
    vertices.push(new THREE.Vector3(startX, startY + radius, adjustedZ))

    // 左上角の円弧
    createArc(startX + radius, startY + radius, Math.PI)

    // 線分を作成するためのインデックス配列
    const indices = []
    for (let i = 0; i < vertices.length - 1; i++) {
      indices.push(i, i + 1)
    }
    // 最後の点と最初の点を結ぶ
    indices.push(vertices.length - 1, 0)

    return { vertices, indices }
  }, [position, width, depth, fillet])

  return (
    <>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(points.vertices.flatMap((v) => [v.x, v.y, v.z])),
              3,
            ]}
          />
          <bufferAttribute
            attach="index"
            args={[new Uint16Array(points.indices), 1]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={lineWidth} />
      </lineSegments>
    </>
  )
}

export default function TrayModel() {
  const { fillet, grid, thickness } = useTrayStore((state) => state)
  const { isDragging, activeAxis } = useSettingsStore((state) => state)
  const { fakeTotalWidth, fakeTotalHeight, fakeTotalDepth } = useFakeTrayStore(
    (state) => state
  )

  // 角丸の長方形のShapeを作成
  const shape = useMemo(() => {
    const shape = new THREE.Shape()

    // 長方形の中心を原点として座標を計算
    const width = fakeTotalWidth
    const depth = fakeTotalDepth
    const radius = fillet

    // 角丸の長方形のパスを描画（時計回り）
    shape.moveTo(-width / 2 + radius, -depth / 2)
    shape.lineTo(width / 2 - radius, -depth / 2)
    shape.quadraticCurveTo(
      width / 2,
      -depth / 2,
      width / 2,
      -depth / 2 + radius
    )
    shape.lineTo(width / 2, depth / 2 - radius)
    shape.quadraticCurveTo(width / 2, depth / 2, width / 2 - radius, depth / 2)
    shape.lineTo(-width / 2 + radius, depth / 2)
    shape.quadraticCurveTo(
      -width / 2,
      depth / 2,
      -width / 2,
      depth / 2 - radius
    )
    shape.lineTo(-width / 2, -depth / 2 + radius)
    shape.quadraticCurveTo(
      -width / 2,
      -depth / 2,
      -width / 2 + radius,
      -depth / 2
    )

    return shape
  }, [fakeTotalDepth, fakeTotalWidth, fillet])

  // 押し出し設定
  const extrudeSettings: THREE.ExtrudeGeometryOptions = useMemo(() => {
    return {
      steps: 1,
      depth: fakeTotalHeight,
      bevelEnabled: true,
    }
  }, [fakeTotalHeight])

  // グリッドセルのデータを計算
  const gridCells = useMemo(() => {
    const cells: {
      position: [number, number, number]
      width: number
      depth: number
    }[] = []

    // 初期X位置
    let xOffset = -fakeTotalWidth / 2 + thickness

    // 各行を処理
    grid.forEach((row, index) => {
      if (index > 0) {
        // 前の行の幅と厚みを足してxOffsetを更新
        xOffset += grid[index - 1].width + thickness
      }

      // トレイの中心を原点として、縦方向に行を配置
      const yOffset = -fakeTotalDepth / 2 + thickness

      // 各セルを処理
      for (let i = 0; i < row.column.length; i++) {
        // iまでのcolumnのdepthの累計を計算
        const totalDepth = row.column
          .slice(0, i)
          .reduce((acc, c) => acc + (c.depth || 0), 0)
        // 位置を直接計算
        const currentYOffset = yOffset + totalDepth + thickness * i
        // セルの深さを計算
        const cellDepth = row.column[i].depth

        // セルの情報を追加
        cells.push({
          position: [xOffset, currentYOffset, fakeTotalHeight],
          width: row.width,
          depth: cellDepth,
        })
      }
    })

    return cells
  }, [grid, fakeTotalWidth, fakeTotalDepth, fakeTotalHeight, thickness])

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color="#fff" side={THREE.DoubleSide} />
      </mesh>
      <Dim3d
        pointA={[-fakeTotalWidth / 2, -fakeTotalDepth / 2, 0]}
        pointB={[fakeTotalWidth / 2, -fakeTotalDepth / 2, 0]}
        label={"width"}
        active={activeAxis === "width"}
        value={fakeTotalWidth}
      />
      <Dim3d
        pointA={[fakeTotalWidth / 2, -fakeTotalDepth / 2, 0]}
        pointB={[fakeTotalWidth / 2, fakeTotalDepth / 2, 0]}
        label={"depth"}
        active={activeAxis === "depth"}
        value={fakeTotalDepth}
      />
      <Dim3d
        pointA={[fakeTotalWidth / 2, fakeTotalDepth / 2, 0]}
        pointB={[fakeTotalWidth / 2, fakeTotalDepth / 2, fakeTotalHeight]}
        label={"height"}
        active={activeAxis === "height"}
        value={fakeTotalHeight}
      />

      {/* グリッドセルの描画（角丸長方形の線） */}
      {!isDragging &&
        gridCells.map((cell, index) => (
          <RoundedRectangleLine
            key={`grid-cell-${index}`}
            position={cell.position}
            width={cell.width}
            depth={cell.depth}
            fillet={fillet}
            color="#999"
          />
        ))}
    </group>
  )
}
