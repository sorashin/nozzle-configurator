import Icon from "@/components/common/ui/Icon"
import { useNavigationStore } from "@/stores/navigation"
import React from "react"
import { Toast as ToastType, useSettingsStore } from "@/stores/settings"

const NavButton: React.FC<{
  label: string
  icon: string
  isActive: boolean
  isLoading: boolean
  onClick: () => void
}> = ({ label, icon, isActive, isLoading, onClick }) => {
  return (
    <button
      className={`w-fit p-2 flex justify-center items-center gap-2 rounded-sm cursor-pointer ${
        isActive
          ? "bg-[rgba(255,255,255,.56)] shadow-sm"
          : "transparent shadow-none hover:bg-[rgba(255,255,255,.16)]"
      } text-content-h text-xs  transition-all`}
      onClick={() => {
        onClick()
      }}>
      {isLoading ? (
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
      ) : (
        <Icon name={icon} className="w-6 h-6" />
      )}
      {label}
    </button>
  )
}

export interface HeaderProps {
  onClickDL: () => void
}
export const Header: React.FC<HeaderProps> = ({ onClickDL }) => {
  const { currentNav, currentNavArray, setCurrentNav } = useNavigationStore()
  const { isPreviewLoad, setIsPreviewLoad, setToast, toast } =
    useSettingsStore()
  const handleToast = () => {
    const i: ToastType = {
      content:
        "Generating STL data — this may take up to several dozen seconds.",
      type: "default",
      isOpen: true,
    }
    setToast([...toast, i])
  }

  return (
    <header className="absolute inset-x-0 top-0 pt-8 px-4 flex flex-col justify-between z-20">
      <div className="flex justify-between md:justify-center items-center gap-2 w-full font-display">
        {currentNavArray.map((item, index) => (
          <React.Fragment key={item.label}>
            <NavButton
              key={item.label}
              label={item.label}
              icon={item.icon}
              isActive={currentNav === index}
              isLoading={index == 2 && isPreviewLoad}
              onClick={() => {
                if (index == 2) {
                  setIsPreviewLoad(true)
                  handleToast()
                  // currentNavが変更されるとnodeのevaluationが走ってその後のレンダリング処理がブロックされるため、タイムアウトを設ける
                  setTimeout(() => {
                    setCurrentNav(index)
                    onClickDL()
                  }, 500)
                } else {
                  setCurrentNav(index)
                }
              }}
            />
            {index < currentNavArray.length - 1 && (
              <Icon
                name="chevron-right"
                className="w-4 h-4 text-content-m-a"></Icon>
            )}
          </React.Fragment>
        ))}
      </div>
    </header>
  )
}
