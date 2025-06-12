import { useTrayStore } from "@/stores/tray"
import Icon from "./Icon"
import { useState } from "react"

type DimProps = {
  rowId: string
  colId?: string
  position: "top" | "left" | "right" | "bottom"
  offset: number
}

const Dim: React.FC<DimProps> = ({ colId, rowId, position, offset }) => {
  const { grid, updateRow, mm2pixel, thickness } = useTrayStore()
  const row = grid.find((r) => r.id === rowId)
  const col = row?.column.find((c) => c.id === colId)
  //一時的にinputの値を保持するstateを作成
  const [inputValue, setInputValue] = useState<string>(
    colId ? col!.depth.toString() : row!.width.toString()
  )

  if (!row) return null

  // typeの変更を処理するハンドラ
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as "fill" | "1/2" | "1/3" | "fixed"

    if (colId) {
      // 列のtypeを更新
      const updatedColumn = row.column.map((c) =>
        c.id === colId ? { ...c, type: newType } : c
      )
      updateRow(rowId, { column: updatedColumn })
    } else {
      // 行のtypeを更新
      updateRow(rowId, { type: newType })
    }
  }

  // 寸法の変更を処理するハンドラ
  const handleSizeChange = (newValue: string) => {
    // 小数第1位までのフォーマットに制限（正規表現で検証）
    if (newValue && /^\d+(\.\d{0,1})?$/.test(newValue)) {
      const numValue = parseFloat(newValue)
      if (!isNaN(numValue)) {
        if (colId) {
          // 列の深さを更新
          const updatedColumn = row.column.map((c) =>
            c.id === colId ? { ...c, depth: numValue } : c
          )
          updateRow(rowId, { column: updatedColumn })
        } else {
          // 行の幅を更新
          updateRow(rowId, { width: numValue })
        }
      }
    }
  }

  // スタイルを計算
  const getStyleByPosition = (colOffset: number) => {
    const pixelDepth = col?.depth ? col.depth * mm2pixel : row.depth * mm2pixel
    const offsetPx = offset * mm2pixel

    switch (position) {
      case "top":
        return {
          top: 0 + offsetPx,
          left: 0,
          right: 0,
        }
      case "bottom":
        return {
          bottom: 0 + offsetPx,
          left: 0,
          right: 0,
        }
      case "left":
        // colIdが指定されている場合はcolの中央に表示
        if (colId) {
          return {
            left: 0 + offsetPx,
            top: pixelDepth / 2 + colOffset,
            transform: "translateY(-50%) translateX(-50%) rotate(-90deg)",
            transformOrigin: "center",
          }
        } else {
          return {
            left: 0 + offsetPx,
            top: pixelDepth / 2,
            transform: "translateY(-50%) rotate(-90deg)",
          }
        }
      case "right":
        // colIdが指定されている場合はcolの中央に表示
        if (colId) {
          return {
            right: 0 + offsetPx,
            top: pixelDepth / 2 + colOffset,
            transform: "translateY(-50%) translateX(50%) rotate(90deg)",
            transformOrigin: "center",
          }
        } else {
          return {
            right: 0 + offsetPx,
            top: pixelDepth / 2,
            transform: "translateY(-50%) rotate(90deg)",
          }
        }
    }
  }
  //colのrowの中でのindexを取得し、colより若いindexのcolのdepthの累計を計算
  const colIndex = row.column.findIndex((c) => c.id === colId)
  const totalDepth =
    row.column.slice(0, colIndex).reduce((acc, c) => acc + (c.depth || 0), 0) +
    thickness * colIndex

  const dimStyle = getStyleByPosition(totalDepth * mm2pixel)

  // 矢印の長さと位置を計算
  const getArrowDimensions = () => {
    const pixelWidth = row.width * mm2pixel
    const pixelDepth = col?.depth ? col.depth * mm2pixel : row.depth * mm2pixel

    // 水平方向（上下の場合）と垂直方向（左右の場合）で矢印の長さを決定
    let length = 0
    if (position === "top" || position === "bottom") {
      length = pixelWidth - 0 // 左右に少し余白を持たせる
    } else if (position === "left" || position === "right") {
      // 列または行の深さを使用
      length = pixelDepth
    }

    return {
      length,
      height: 10, // 矢印の高さ（太さ）
    }
  }

  const { length, height } = getArrowDimensions()

  // 現在編集するのが行か列か
  if (colId && !col) return null

  const currentType = colId ? col!.type : row.type
  const currentSize = colId ? col!.depth : row.width

  // マーカーIDの一意性を確保
  const markerId = `marker-${rowId}-${colId || "row"}-${position}-${Date.now()}`
  const arrowStartId = `arrowstart-${markerId}`
  const arrowEndId = `arrowend-${markerId}`

  return (
    <div className="absolute flex items-center" style={dimStyle}>
      <div className="flex flex-col items-center w-full">
        <div
          className="flex flex-row items-center bg-system-info rounded-sm z-10 px-[2px]"
          //position="left"または"right"の場合90度回転"
          style={{
            transform:
              position === "left" || position === "right"
                ? "rotate(90deg) translateX(-10%)"
                : "none",
          }}>
          <select
            value={currentType}
            onChange={handleTypeChange}
            className="text-overline p-1 cursor-pointer focus:outline-none">
            <option value="fill">fill(1)</option>
            <option value="1/2">fill(1/2)</option>
            <option value="1/3">fill(1/3)</option>
            <option value="fixed">fixed</option>
          </select>
          <div className="border-r border-content-dark-l-a h-[20px] mx-[2px]"></div>
          {currentType === "fixed" ? (
            <>
              <input
                type="number"
                step="0.1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="h-full px-1 py-[2px] text-xs hover:bg-content-dark-l-a transition w-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-[2px]"
              />
              {/* buttonを押すと、入力した値を確定する */}
              <button
                onClick={() => handleSizeChange(inputValue)}
                className="hover:bg-content-dark-l-a transition rounded-sm cursor-pointer">
                <Icon name="check" className="size-4" />
              </button>
            </>
          ) : (
            <p className="h-full px-1 py-[2px] text-xs text-content-dark-m-a">
              {currentSize}
            </p>
          )}
        </div>
        <svg width={length} height={height} className="">
          <defs>
            <marker
              id={arrowStartId}
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto">
              <polygon
                points="10 0, 0 3.5, 10 7"
                fill="var(--color-system-info)"
              />
            </marker>
            <marker
              id={arrowEndId}
              markerWidth="10"
              markerHeight="7"
              refX="0"
              refY="3.5"
              orient="auto">
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="var(--color-system-info)"
              />
            </marker>
          </defs>
          <line
            x1="10"
            y1={height / 2}
            x2={length - 10}
            y2={height / 2}
            stroke="var(--color-system-info)"
            strokeWidth="1"
            markerStart={`url(#${arrowStartId})`}
            markerEnd={`url(#${arrowEndId})`}
          />
        </svg>
      </div>
    </div>
  )
}

export default Dim
