import { useSettingsStore } from "@/stores/settings"
import { useFakeTrayStore, useTrayStore } from "@/stores/tray"
import { useEffect, useRef, useState } from "react"
import Icon from "./Icon"

interface RangeSliderProps {
  min: number
  max: number
  label: "" | "width" | "height" | "depth"
  position: "top" | "left" | "right" | "bottom"
}

export const RangeSlider: React.FC<RangeSliderProps> = (props) => {
  const { max, min, label, position } = props
  const { updateSize, totalWidth, totalDepth, totalHeight } = useTrayStore()
  const { updateFakeSize } = useFakeTrayStore()
  const { setActiveAxis, activeAxis } = useSettingsStore()
  const inputRef = useRef<HTMLInputElement>(null)

  // labelに基づいて適切な初期値を取得
  const getInitialValue = () => {
    switch (label) {
      case "width":
        return totalWidth
      case "depth":
        return totalDepth
      case "height":
        return totalHeight
      default:
        return 105
    }
  }

  const [value, setValue] = useState(getInitialValue()) // 現在の設定値
  const [yPos, setYPos] = useState(0) // 現在のボーダー幅
  const [startY, setStartY] = useState(0) // ドラッグ開始時のY座標
  const [startX, setStartX] = useState(0) // ドラッグ開始時のX座標
  const { setCameraMode, setIsDragging, isDragging } = useSettingsStore()
  const rulerRange = 400

  // 扇状の目盛りのために
  const tickCount = max - min // より細かい目盛り
  const arcAngle = 240 // 扇の角度範囲（度）
  const arcRadius = 1200 // 扇の半径

  // 位置に応じたクラス名を生成
  const getPositionClasses = () => {
    switch (position) {
      case "left":
        return "fixed left-8 lg:left-16 top-1/2 -translate-y-1/2 h-14"
      case "right":
        return "fixed right-8 lg:right-16 top-1/2 -translate-y-1/2 h-14"
      case "top":
        return "fixed top-8 lg:top-16 left-1/2 -translate-x-1/2 w-32"
      case "bottom":
      default:
        return "fixed bottom-8 lg:bottom-16 left-1/2 -translate-x-1/2 w-32"
    }
  }

  // スライダーの向きを取得
  const getSliderOrientation = () => {
    return ["left", "right"].includes(position) ? "vertical" : "horizontal"
  }

  // Y座標またはX座標の変化に基づいて値を更新
  const calculateNewValue = (currentPos: number) => {
    // 垂直か水平かによって異なる計算を使用
    if (["left", "right"].includes(position)) {
      const diffY = startY - currentPos // 方向を反転（マイナスをつけない）
      const newYPos = Math.max(-rulerRange, Math.min(rulerRange, diffY))
      const mappedValue =
        Math.round(((newYPos + rulerRange) / (rulerRange * 2)) * (max - min)) +
        min

      setValue(mappedValue)
      setYPos(newYPos)
    } else {
      const diffX = startX - currentPos // 方向を反転（マイナスをつけない）
      const newXPos = Math.max(-rulerRange, Math.min(rulerRange, diffX))
      const mappedValue =
        Math.round(((newXPos + rulerRange) / (rulerRange * 2)) * (max - min)) +
        min

      setValue(mappedValue)
      setYPos(newXPos) // yPosを再利用
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (/^\d*$/.test(newValue)) {
      // 数字のみを許可
      const numericValue = Math.floor(Number(newValue)) // 小数点以下を切り捨て
      updateFakeSize({
        width: label === "width" ? numericValue : undefined,
        depth: label === "depth" ? numericValue : undefined,
        height: label === "height" ? numericValue : undefined,
      })
      updateSize({
        width: label === "width" ? numericValue : undefined,
        depth: label === "depth" ? numericValue : undefined,
        height: label === "height" ? numericValue : undefined,
      })
    } else {
      inputRef.current!.value = String(value)
    }
  }

  // 扇状の目盛りを描画するコンポーネント
  const RulerTicks = () => {
    const isVertical = ["left", "right"].includes(position)

    const baseAngleOffset = (position: string) => {
      switch (position) {
        case "left":
          return 90
        case "right":
          return -90
        case "bottom":
          return 90
        default:
          return 0
      }
    }

    // 目盛りを回転させるために現在の値から角度オフセットを計算
    const valueRatio = (value - min) / (max - min) // 0～1の範囲
    const centerAngleOffset = valueRatio * arcAngle - arcAngle / 2

    // 扇状に配置するための目盛りの配列を生成
    const ticks = Array.from({ length: tickCount }, (_, i) => {
      const tickValue = min + (i / (tickCount - 1)) * (max - min)
      const isCurrent =
        Math.abs(tickValue - value) < (max - min) / (tickCount - 1) / 2

      // 扇状の配置を計算（現在の値が中央に来るように回転）
      const baseAngle =
        -arcAngle / 2 +
        (arcAngle / (tickCount - 1)) * i +
        baseAngleOffset(position)
      const angleInDegrees = baseAngle - centerAngleOffset

      // 扇状の位置を計算（CSSの変形に使用）
      const tickStyle = {
        transform: isVertical
          ? `rotate(${angleInDegrees}deg) translateY(-${arcRadius}px)`
          : `rotate(${angleInDegrees}deg) translateX(-${arcRadius}px)`,
        transformOrigin:
          position === "left"
            ? "center left"
            : position === "right"
            ? "center right"
            : position === "bottom"
            ? "bottom center"
            : "top center",
        height: isVertical ? `${arcRadius}px` : "auto",
        width: isVertical ? "auto" : `${arcRadius}px`,
        position: "absolute" as const,
        display: "flex",
        justifyContent: isVertical ? "center" : "flex-end",
        alignItems: isVertical ? "flex-end" : "center",
      }

      // 目盛りの長さを調整
      const tickLength = isCurrent
        ? 64
        : Math.round(tickValue) % 10 === 0
        ? 16
        : Math.round(tickValue) % 5 === 0
        ? 8
        : 4

      return (
        <div key={i} style={tickStyle}>
          <div /* 目盛りとなる棒 */
            className={`
              ${isVertical ? "w-[1px]" : "h-[1px]"} 
              ${
                Math.round(tickValue) % 5 === 0
                  ? "bg-content-h-a"
                  : "bg-content-l-a"
              }
              
            `}
            style={{
              height: isVertical ? `${tickLength}px` : "1px",
              width: isVertical ? "1px" : `${tickLength}px`,
            }}
          />

          {/* 数字は10の倍数の場合のみ表示 */}
          {Math.round(tickValue) % 10 === 0 && !isCurrent && (
            <span
              className={`
                text-xs text-content-m-a px-1
                ${isCurrent ? "!text-content-h-a font-bold" : ""}
                
              `}
              style={{
                transform: isVertical
                  ? `rotate(${-angleInDegrees}deg)` // ラベルを水平に戻す
                  : `rotate(${-angleInDegrees}deg)`, // ラベルを水平に戻す
                marginLeft: isVertical ? 0 : "5px",
                marginBottom: isVertical ? "5px" : 0,
                position: "absolute",
                right: isVertical ? undefined : "10px",
                bottom: isVertical ? "10px" : undefined,
              }}>
              {Math.round(tickValue)}
            </span>
          )}
        </div>
      )
    })

    // 現在値を示す中央線（垂直、常に中央）
    const centerLineStyle = {
      position: "absolute" as const,
      height: isVertical ? `${arcRadius + 10}px` : "2px",
      width: isVertical ? "2px" : `${arcRadius + 10}px`,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      bottom: isVertical ? 0 : "50%",
      left: isVertical ? "50%" : 0,
      transform: isVertical ? "translateX(-50%)" : "translateY(-50%)",
      zIndex: 10,
    }

    return (
      <div
        className={`
          absolute pointer-events-none
          ${isVertical ? "h-[300px] w-[300px]" : "w-[300px] h-[300px]"}
          flex items-center justify-center rounded-full bg-content-xxl-a
          
          
          ${position === "top" ? "top-24" : ""}
          ${position === "bottom" ? "bottom-0)" : ""}
        `}
        style={{
          transform: `${
            isVertical ? "translate(0, -50%)" : "translate(-50%, 0)"
          }`,
          left: isVertical
            ? position === "left"
              ? `-${arcRadius / 2 + 200}px`
              : ``
            : "50%",
          right: isVertical
            ? position === "right"
              ? `-${arcRadius / 2 + 200}px`
              : ``
            : undefined,
          top: isVertical ? "50%" : undefined,
          bottom: isVertical ? undefined : `-${arcRadius / 2 + 200}px`,
        }}>
        <div style={centerLineStyle} />
        {ticks}
      </div>
    )
  }

  // set input value to phantomSize.depth
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = String(value)
    }
  }, [value])

  // 現在のスライダーがドラッグ中かどうかを判定
  const isCurrentlyDragging = activeAxis === label

  return (
    <>
      <div
        className={`group ${getPositionClasses()} transition font-display text-content-dark-h-a pointer-events-auto flex justify-center`}
        onMouseEnter={() => setActiveAxis(label)}
        onMouseLeave={() => setActiveAxis("")}>
        <Icon
          name={
            ["top", "bottom"].includes(position) ? "chevron-left" : "chevron-up"
          }
          className={`absolute ${
            ["top", "bottom"].includes(position)
              ? "-left-6 w-4 h-full group-hover:-left-8"
              : "-top-6 w-full h-4 group-hover:-top-8"
          } transition-all text-content-m-a`}
        />
        <Icon
          name={
            ["top", "bottom"].includes(position)
              ? "chevron-right"
              : "chevron-down"
          }
          className={`absolute ${
            ["top", "bottom"].includes(position)
              ? "-right-6 w-4 h-full group-hover:-right-8"
              : "-bottom-6 w-full h-4 group-hover:-bottom-8"
          } transition-all text-content-m-a`}
        />
        <input
          type="range"
          className={`range-slider ${getSliderOrientation()}`}
          onMouseEnter={() => setActiveAxis(label)}
          onMouseLeave={() => setActiveAxis("")}
          onMouseDown={(e) => {
            setIsDragging(true)
            setActiveAxis(label)
            setStartY(e.clientY)
            setStartX(e.clientX)
            setCameraMode(
              label === "height" || label === "depth" ? "side" : "front"
            )
          }}
          onMouseMove={(e) => {
            if (isDragging && activeAxis === label) {
              calculateNewValue(
                ["left", "right"].includes(position) ? e.clientY : e.clientX
              )

              updateFakeSize({
                width: label === "width" ? value : undefined,
                depth: label === "depth" ? value : undefined,
                height: label === "height" ? value : undefined,
              })
            }
          }}
          onMouseUp={() => {
            setIsDragging(false)
            setActiveAxis("")

            // labelに基づいて適切なプロパティを更新
            const sizeUpdate: {
              width?: number
              depth?: number
              height?: number
            } = {}
            if (label === "width") {
              sizeUpdate.width = value
            } else if (label === "depth") {
              sizeUpdate.depth = value
            } else if (label === "height") {
              sizeUpdate.height = value
            }

            updateSize(sizeUpdate)
            setCameraMode("perspective")
          }}
          onTouchStart={(e) => {
            setIsDragging(true)
            setActiveAxis(label)
            setStartY(e.touches[0].clientY)
            setStartX(e.touches[0].clientX)
          }}
          onTouchMove={(e) => {
            if (isDragging && activeAxis === label) {
              calculateNewValue(
                ["left", "right"].includes(position)
                  ? e.touches[0].clientY
                  : e.touches[0].clientX
              )
              updateFakeSize({
                width: label === "width" ? value : undefined,
                depth: label === "depth" ? value : undefined,
                height: label === "height" ? value : undefined,
              })
            }
          }}
          onTouchEnd={() => {
            setIsDragging(false)
            setActiveAxis("")

            // labelに基づいて適切なプロパティを更新 (タッチイベント用)
            const sizeUpdate: {
              width?: number
              depth?: number
              height?: number
            } = {}
            if (label === "width") {
              sizeUpdate.width = value
            } else if (label === "depth") {
              sizeUpdate.depth = value
            } else if (label === "height") {
              sizeUpdate.height = value
            }

            updateSize(sizeUpdate)
            setCameraMode("perspective")
          }}
        />
        <div className="absolute flex flex-col justify-center items-center gap-[2px] inset-0 h-[56px] w-[128px] text-center pointer-events-none  text-white">
          <p className="text-xs relative text-content-dark-m-a">
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </p>
          <p className="relative items-center flex">
            <input
              type="text"
              className="text-lg max-w-[50px] text-content-white pointer-events-auto bg-transparent hover:bg-content-dark-xl-a rounded-[4px] focus:bg-content-dark-xl-a text-center focus:ring-1 focus:ring-content-dark-l-a focus:outline-none"
              defaultValue={String(value)}
              ref={inputRef}
              onFocus={(e) => e.target.select()}
              onChange={handleInputChange}
              onMouseEnter={() => setActiveAxis(label)}
              onMouseLeave={() => setActiveAxis("")}
            />
            <span className="absolute -right-5 text-overline text-content-dark-m-a">
              mm
            </span>
          </p>
          {isCurrentlyDragging && <RulerTicks />}
          {/* <RulerTicks /> */}
        </div>
      </div>
    </>
  )
}
