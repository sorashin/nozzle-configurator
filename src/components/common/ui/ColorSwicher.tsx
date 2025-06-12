import Icon from "@/components/common/ui/Icon"

import React, { useState, useRef, useEffect } from "react"
import filaments from "@/assets/filaments.json"
import { Color, FillamentState, useSettingsStore } from "@/stores/settings"
import { Tooltip } from "react-tooltip"
import { AnimatePresence, motion } from "framer-motion"
import { useParams } from "react-router-dom"

export interface ColorSwitcherProps {}
export const ColorSwitcher: React.FC<ColorSwitcherProps> = () => {
  const { currentFillament, setFillament, setBom } = useSettingsStore()
  const [hoveredFilament, setHoveredFilament] = useState<any>(null)

  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { slug } = useParams<{ slug: string }>()
  

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  

  return (
    <motion.div
      ref={containerRef}
      className={`flex gap-2 pointer-events-auto  bg-surface-sheet-h rounded-lg  items-start ${
        isExpanded ? "p-4" : "p-2"
      }`}
      layout>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <>
            <div className="flex flex-col gap-2 h-full overflow-y-auto p-2">
              {filaments.map((item) => {
                // HEXをRGBに変換
                function hexToRgb(hex: string) {
                  const result =
                    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
                  return result
                    ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16),
                      }
                    : null
                }
                // 距離計算
                function colorDistance(c1: string, c2: string) {
                  const rgb1 = hexToRgb(c1)
                  const rgb2 = hexToRgb(c2)
                  if (!rgb1 || !rgb2) return Infinity
                  return Math.sqrt(
                    Math.pow(rgb1.r - rgb2.r, 2) +
                      Math.pow(rgb1.g - rgb2.g, 2) +
                      Math.pow(rgb1.b - rgb2.b, 2)
                  )
                }
                // 並べ替え（シリーズの最初の色を基準に固定）
                const baseHex = item.colors[0].hex
                const sortedColors = [...item.colors].sort(
                  (a, b) =>
                    colorDistance(a.hex, baseHex) -
                    colorDistance(b.hex, baseHex)
                )
                return (
                  <>
                    <p className="font-semibold text-content-m-a">
                      {item.series}
                    </p>
                    <div className="grid grid-cols-6 gap-4 w-fit ">
                      {sortedColors.map((color) => (
                        <div
                          key={color.name}
                          data-tooltip-id="color-tooltip"
                          data-tooltip-content={color.name}
                          style={{ backgroundColor: color.hex }}
                          className="w-7 h-7 rounded-full cursor-pointer relative"
                          onMouseEnter={() =>
                            setHoveredFilament({
                              ...currentFillament,
                              color: {
                                name: color.name,
                                sampleImage: color.sampleImage,
                                hex: color.hex,
                                threeHEX: color.threeHEX,
                                metalness: color.metalness,
                                roughness: color.roughness,
                                url: color.url,
                                ogImage: color.ogImage,
                              },
                            })
                          }
                          onMouseLeave={() => setHoveredFilament(null)}
                          onClick={() => {
                            setFillament({
                              ...currentFillament,
                              color: {
                                name: color.name,
                                sampleImage: color.sampleImage,
                                hex: color.hex,
                                threeHEX: color.threeHEX,
                                metalness: color.metalness,
                                roughness: color.roughness,
                                url: color.url,
                                ogImage: color.ogImage,
                              },
                            })
                          }}>
                          {color.name === currentFillament.color.name &&
                            item.series === currentFillament.series && (
                              <span
                                className="w-9 h-9 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent border-2 opacity-50"
                                style={{ borderColor: color.hex }}></span>
                            )}
                        </div>
                      ))}
                    </div>
                  </>
                )
              })}
            </div>
            <motion.div layoutId="color-image" className="flex flex-col gap-2">
              <motion.img
                src={
                  hoveredFilament?.color?.sampleImage ||
                  currentFillament.color.sampleImage
                }
                alt=""
                className="w-full h-64 rounded-md object-cover"
                layoutId="color-image2"
              />

              <a
                className="relative grid grid-cols-[auto_1fr] gap-1 border-content-l-a border-[0.5px] rounded-sm overflow-hidden cursor-pointer"
                href={hoveredFilament?.color?.url || currentFillament.color.url}
                target="_blank">
                <img
                  src={
                    hoveredFilament?.color?.ogImage ||
                    currentFillament.color.ogImage
                  }
                  alt=""
                  className="size-32 object-cover pointer-events-none"
                />
                <div className="p-1 pointer-events-none flex flex-col justify-start">
                  <p className="text-sm text-content-m-a">
                    {hoveredFilament?.color?.name ||
                      currentFillament.color.name}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-content-m-a">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${
                        new URL(currentFillament.color.url).hostname
                      }`}
                      alt=""
                      className="size-3 rounded-full"
                    />
                    <span className="text-content-m-a">
                      {new URL(currentFillament.color.url).hostname}
                    </span>
                  </p>
                </div>
                <button className="b-button rounded-full absolute right-2 bottom-2  !text-content-dark-h-a !bg-content-h !hover:!bg-content-m">
                  $22.99
                </button>
              </a>
            </motion.div>
          </>
        ) : (
          <motion.div className="flex items-center gap-2">
            {slug === "bento3d" && (
              <>
                <div className="b-input flex justify-center items-center gap-2 pointer-events-none text-content-m h-9">
                  <Icon name="bom-shrink" className="size-8" />

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    defaultValue={0}
                    onChange={(e) => setBom(Number(e.target.value))}
                  />

                  <Icon name="bom-explode" className="size-8" />
                </div>
                <span className="w-[1px] h-8 bg-content-l-a block" />
              </>
            )}
            <motion.div
              className="flex items-center gap-2 cursor-pointer relative"
              layout>
              <div
                className="flex items-center gap-2 group"
                onClick={() => setIsExpanded(true)}>
                <div className="relative size-8">
                  <span
                    className="absolute inset-1 rounded-full"
                    style={{
                      backgroundColor: currentFillament.color.hex,
                    }}></span>
                  <img
                    src="/images/spool.png"
                    alt=""
                    className="size-full relative group-hover:animate-[spin_2s_linear_infinite]"
                  />
                </div>
                <p className="text-sm text-content-h-a">
                  <span className="text-content-m-a text-xs -mb-1">
                    {currentFillament.series}
                  </span>
                  <br />
                  {currentFillament.color.name}
                </p>
              </div>
              <a
                className="b-button rounded-full items-center"
                href={currentFillament.color.url}
                target="_blank"
                onClick={(e) => e.stopPropagation()}>
                $22.99
                <Icon
                  name="chevron-right"
                  className="size-4 text-content-l-a"
                />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Tooltip
        id="color-tooltip"
        place="bottom"
        className="text-xs"
        style={{
          backgroundColor: "#1C1C1C",
          color: "#ffffff",
          fontSize: "12px",
          padding: "2px 4px 2px 4px",
          borderRadius: "4px",
          userSelect: "none",
          fontFamily: "sans-serif",
        }}
        noArrow
      />
    </motion.div>
  )
}
