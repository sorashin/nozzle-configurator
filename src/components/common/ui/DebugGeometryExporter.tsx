import { useModularStore } from "@/stores/modular"
import { showSaveFilePicker } from "@/utils/filePicker"
import { FC, useCallback, useState } from "react"
import { DoubleSide, Mesh, MeshStandardMaterial, Object3D } from "three"
import { STLExporter } from "three-stdlib"

const DebugGeometryExporter: FC = () => {
  const [format, setFormat] = useState<string | null>("stl")
  const geometries = useModularStore((state) => state.geometries)

  const parseMesh = useCallback(
    async (object: Object3D) => {
      switch (format) {
        case "stl": {
          return new STLExporter().parse(object)
        }
      }
      return null
    },
    [format]
  )

  const handleExportSingle = useCallback(
    async (index: number) => {
      if (!format || !geometries[index]) return

      const { id, geometry } = geometries[index]
      // IDを含めたファイル名にする - IDは文字列として扱う
      const fileName = `geometry_${String(id).slice(0, 8)}`

      if (format === "json") {
        await showSaveFilePicker({
          generator: () => Promise.resolve(JSON.stringify(geometry)),
          suggestedName: `${fileName}.${format}`,
          types: [
            {
              description: `${format?.toUpperCase()} file`,
              accept: {
                "application/octet-stream": [`.${format}`],
              },
            },
          ],
        })
      } else {
        await showSaveFilePicker({
          generator: async () => {
            const mesh = new Mesh(
              geometry.clone(),
              new MeshStandardMaterial({
                side: DoubleSide,
              })
            )

            const root = new Object3D()
            root.add(mesh)

            const data = await parseMesh(root)
            return data
          },
          suggestedName: `${fileName}.${format}`,
          types: [
            {
              description: `${format?.toUpperCase()} file`,
              accept: {
                "application/octet-stream": [`.${format}`],
              },
            },
          ],
        })
      }
    },
    [format, geometries, parseMesh]
  )

  return (
    <div className="p-3">
      <div className="mb-4">
        <select
          className="px-2 py-1 border border-gray-300 rounded"
          value={format || ""}
          onChange={(e) => setFormat(e.target.value || null)}>
          <option value="stl">STL</option>
          <option value="obj">OBJ</option>
          <option value="gltf">GLTF</option>
          <option value="glb">GLB</option>
          <option value="ply">PLY</option>
          <option value="json">JSON</option>
        </select>
      </div>

      {geometries.length > 0 ? (
        <div className="mt-3">
          <h4 className="font-medium text-lg mb-2">ジオメトリ一覧</h4>
          <ul className="divide-y divide-gray-200">
            {geometries.map(({ id, geometry }, index) => (
              <li
                key={index}
                className="flex justify-between items-center py-2">
                <div className="geometry-name">
                  ID: {String(id.geometryId).slice(0, 8)}
                  <span className="text-xs text-gray-500 ml-2">
                    (頂点: {geometry.attributes.position.count})
                  </span>
                </div>
                <button
                  onClick={() => handleExportSingle(index)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  ダウンロード
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-gray-500">ジオメトリがありません</div>
      )}
    </div>
  )
}

export default DebugGeometryExporter
