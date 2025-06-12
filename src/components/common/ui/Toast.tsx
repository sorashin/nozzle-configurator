import { FC } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useSettingsStore } from "@/stores/settings"

// define type
type ToastProps = {
  persistent?: boolean
}

export const Toast: FC<ToastProps> = () => {
  const { toast } = useSettingsStore((state) => state)

  return (
    <AnimatePresence>
      {toast.map(
        (t, i) =>
          t.isOpen && (
            <motion.div
              key={i}
              className={`fixed flex justify-center inset-x-0 top-24 z-10 ${
                t.type === "error"
                  ? "bg-red-500"
                  : t.type === "warn"
                  ? "bg-yellow-500"
                  : "bg-content-h"
              } rounded-full w-fit mx-auto`}
              initial="hidden"
              exit="hidden"
              variants={{
                show: { y: 0 + i * 64, opacity: 1 },
                hidden: { y: -20 + i * 64, opacity: 0 },
              }}
              animate={t.isOpen ? "show" : "animate"}
              transition={{
                type: "spring",
                damping: 40,
                stiffness: 400,
              }}>
              <p className="w-fit p-4 rounded-sm text-white text-sm font-semibold font-sans">
                {t.content}
              </p>
            </motion.div>
          )
      )}
    </AnimatePresence>
  )
}
