import { useCallback, useEffect, useState } from "react"
import Icon from "@/components/common/ui/Icon"
import { Tooltip } from "react-tooltip"
import { useSettingsStore } from "@/stores/settings"
import { useNavigate, useLocation } from "react-router-dom"
import { useTrayStore } from "@/stores/tray"
import { motion } from "framer-motion"
import { useNavigationStore } from "@/stores/navigation"

const modes = [
  {
    label: "Partition",
    slug: "tray",
    img: "bento-partition",
    sampleImg: ["/images/partitions/000.png", "/images/partitions/004.jpg"],
  },
  {
    label: "Partition & Box",
    slug: "bento3d",
    img: "bento-box",
    sampleImg: [
      "/images/cases/000.jpg",
      "/images/cases/001.jpg",
      "/images/cases/002.png",
    ],
  },
]

export const LeftMenu = () => {
  const [currentMode, setCurrentMode] = useState(0)
  const { currentNav } = useNavigationStore((state) => state)
  const { isSettingsOpen, setIsSettingsOpen } = useSettingsStore(
    (state) => state
  )
  const { setIsStack, setThickness, setFillet, thickness, isStack, fillet } =
    useTrayStore((state) => state)
  const navigate = useNavigate()
  const location = useLocation()

  // URLのパスからslugを取得して、対応するモードインデックスを設定
  useEffect(() => {
    const currentPath = location.pathname
    const slug = currentPath.split("/")[1] // パスからslugを抽出

    // slugに合わせてcurrentModeを設定
    const modeIndex = modes.findIndex((mode) => mode.slug === slug)
    if (modeIndex !== -1) {
      setCurrentMode(modeIndex)
    }
  }, [location.pathname])

  const handleModeChange = (slug: string) => {
    navigate(`/${slug}`)
  }
  const handleMenuReset = useCallback(() => {
    setIsStack(false)
    setThickness(2)
    setFillet(2)
  }, [])
  useEffect(() => {
    handleMenuReset()
  }, [currentMode])

  return (
    <motion.div
      className="absolute top-8 left-8 z-20 w-[240px] h-fit flex flex-col gap-2 items-start font-display bg-surface-sheet-l backdrop-blur-lg rounded-md p-1"
      layout>
      <motion.div className="flex flex-row items-center gap-2 w-full" layout>
        <button className="b-button bg-surface-sheet-h flex flex-row items-center gap-2 min-w-[180px] hover:bg-[rgba(255,255,255,.56)] px-4 b-dropdown group relative">
          <Icon
            name={modes[currentMode].img}
            className="w-8 h-8 stroke-3 stroke-content-m"
          />
          <p className="flex-grow text-left font-semibold text-content-h-a">
            {modes[currentMode].label}
          </p>

          <Icon
            name="chevron-down"
            className="size-4 text-content-m group-hover:translate-y-0.5 transition-all"
          />
          <div className="b-dropdown-contents left-0 top-[calc(100%+8px)] origin-[20%_0%] bg-surface-base shadow-lg rounded-sm p-2 z-10">
            <ul className="flex flex-row gap-2">
              {modes.map((mode, index) => (
                <li
                  key={index}
                  className="flex flex-col items-center gap-2 w-[240px] hover:bg-[rgba(255,255,255,.72)] group child-group p-2 rounded-[6px]"
                  onClick={() => handleModeChange(mode.slug)}>
                  <p className="w-full text-left text-lg mb-4 ml-2 mt-2 font-semibold text-content-h-a">
                    {mode.label}
                  </p>
                  <Icon
                    name={mode.img}
                    className="size-2/3 stroke-[2px] stroke-content-m mb-4"
                  />
                  <div className="grid grid-cols-3 gap-1 w-full">
                    {mode.sampleImg.map((img, index) => (
                      <img
                        src={img}
                        className="size-full rounded-sm filter saturate-60 opacity-80 mix-blend-multiply child-group-hover:saturate-100 child-group-hover:opacity-100"
                        key={index}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </button>
        <motion.button
          className={`b-button ${
            currentNav !== 2
              ? "!text-content-m-a !cursor-pointer !hover:bg-surface-sheet-l"
              : "!text-content-xl-a !cursor-default !hover:bg-transparent"
          }`}
          onClick={() => {
            if (currentNav !== 2) {
              setIsSettingsOpen(!isSettingsOpen)
            }
          }}
          layout
          data-tooltip-content={"settings"}
          data-tooltip-id="setting-tooltip">
          <Icon
            name={`${!isSettingsOpen ? "config" : "shrink"}`}
            className={`size-6  `}
          />
        </motion.button>
      </motion.div>
      {isSettingsOpen && (
        <motion.div className="flex flex-col gap-2 w-full">
          <label htmlFor="thickness" className="text-content-m-a text-xs">
            Thickness
          </label>
          <div className="flex items-center w-full relative">
            <input
              value={thickness}
              type="range"
              min={1}
              max={5}
              step={0.1}
              onChange={(e) => setThickness(parseFloat(e.target.value))}
              className="b-input-range h-8 w-full cursor-pointer appearance-none overflow-hidden rounded-lg bg-content-xxl-a transition-all hover:bg-[rgba(28,28,28,.08)]"></input>
            <span className="absolute right-2 text-sm text-content-m-a">
              {thickness}
            </span>
          </div>
          {currentMode !== 1 && (
            <>
              <label htmlFor="isStack" className="text-content-m-a text-xs">
                Stack
              </label>
              <ul className="grid grid-cols-2 w-full rounded-md bg-content-xxl-a">
                <li
                  onClick={() => setIsStack(false)}
                  className={`cursor-pointer flex flex-col items-center rounded-sm p-1 text-content-m-a ${
                    !isStack ? "bg-white" : "hover:bg-content-xxl-a"
                  }`}>
                  <Icon name="unstackable" className="size-8 "></Icon>
                  <span className="text-xs text-center font-sans">
                    unstackable
                  </span>
                </li>
                <li
                  onClick={() => setIsStack(true)}
                  className={`cursor-pointer flex flex-col items-center rounded-sm p-1 text-content-m-a ${
                    isStack ? "bg-white" : "hover:bg-content-xxl-a"
                  }`}>
                  <Icon name="stack" className="size-8 "></Icon>
                  <span className="text-xs text-center font-sans">
                    stackable
                  </span>
                </li>
              </ul>
            </>
          )}

          <label htmlFor="thickness" className="text-content-m-a text-xs">
            Fillet
          </label>
          <div className="flex items-center w-full relative">
            <input
              value={fillet}
              type="range"
              min={1}
              max={5}
              step={0.1}
              onChange={(e) => setFillet(parseFloat(e.target.value))}
              className="b-input-range h-8 w-full cursor-pointer appearance-none overflow-hidden rounded-lg bg-content-xxl-a transition-all hover:bg-[rgba(28,28,28,.08)]"></input>
            <span className="absolute right-2 text-sm text-content-m-a">
              {fillet}
            </span>
          </div>
        </motion.div>
      )}

      {!isSettingsOpen && (
        <Tooltip
          id="setting-tooltip"
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
      )}
    </motion.div>
  )
}
