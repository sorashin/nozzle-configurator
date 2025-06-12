import Icon from "@/components/common/ui/Icon"
import { useTrayStore } from "@/stores/tray"
import { motion } from "framer-motion"
import Dim from "./Dim"

export const GridEditor = () => {
  const {
    totalWidth,
    totalDepth,

    mm2pixel,
    fillet,
    thickness,
    grid,
    addRow,
    addColumn,
    removeColumn,
    setSelectedColumnId,
  } = useTrayStore((state) => state)

  return (
    <>
      <motion.div
        layout
        className={`relative flex flex-row gap-4 p-4 ${
          totalWidth - totalDepth > 0 ? "w-full h-full" : "w-full h-full"
        } rounded-md border-content-dark-l-a border-[0.5px] grid-shadow-outer font-display bg-white`}
        data-size={`w:${totalWidth} d:${totalDepth}`}
        style={{
          padding: thickness * mm2pixel,
          gap: thickness * mm2pixel,
          borderRadius: fillet * mm2pixel,
          width: totalWidth * mm2pixel,
          height: totalDepth * mm2pixel,
        }}>
        {grid.map((row, index) => (
          <div className="relative flex flex-col" key={row.id}>
            <motion.div
              className="relative flex flex-col"
              layout
              initial={false}
              data-size={`w:${row.width} d:${totalDepth - 2 * thickness}`}
              animate={{
                width: row.width * mm2pixel,
                height: (totalDepth - 2 * thickness) * mm2pixel,
              }}
              style={{
                borderRadius: fillet * mm2pixel,
                gap: thickness * mm2pixel,
              }}>
              {row.column.map((col, i) => (
                <motion.div
                  data-row-id={row.id}
                  data-column-id={row.id + i}
                  data-size={`w:${row.width} d:${col.depth}`}
                  key={i}
                  initial={false}
                  animate={{
                    height: col.depth * mm2pixel,

                    borderRadius: fillet * mm2pixel,
                  }}
                  className="group w-full flex flex-col justify-center items-center grid-bottom-layer border-content-l border-[0.5px] grid-shadow-inner"
                  onClick={() => setSelectedColumnId(row.id + i)}>
                  <div className="invisible group-hover:visible transition size-full flex justify-center items-center">
                    {/* row用 */}
                    <Dim
                      // colId={JSON.stringify(i)}
                      rowId={row.id}
                      position={"top"}
                      offset={2}
                    />
                    {/* col用 */}
                    <Dim
                      colId={col.id}
                      rowId={row.id}
                      position={"left"}
                      offset={2}
                    />
                    <Icon
                      name="trash"
                      className="cursor-pointer"
                      onClick={() => {
                        removeColumn(row.id, col.id)
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
            {index == grid.length - 1 && (
              <button
                className="b-round-button absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2"
                onClick={() => {
                  addRow({
                    id: crypto.randomUUID(),
                    depth: totalDepth - 2 * thickness,
                    type: "fill",
                    column: [
                      {
                        id: crypto.randomUUID(),
                        depth: totalDepth - 2 * thickness,
                        type: "fill",
                      },
                    ],
                  })
                }}>
                <Icon name="plus" />
              </button>
            )}
            <button
              className="b-round-button absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2"
              onClick={() => {
                addColumn(row.id)
              }}>
              <Icon name="plus" />
            </button>
          </div>
        ))}
      </motion.div>
    </>
  )
}
