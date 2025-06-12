import GeometryExporter from "@/components/common/ui/GeometryExporter"
import Canvas from "@/components/gridfinity/3d/Canvas"

export function Page() {
  return (
    <>
      <Canvas />
      <div className="absolute bottom-16 right-16">
        <GeometryExporter />
      </div>
    </>
  )
}
