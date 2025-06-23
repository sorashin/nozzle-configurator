import { ManifoldGeometriesWithInfo } from "@/stores/modular"
import { Box, MeshTransmissionMaterial, Plane } from "@react-three/drei"

import { ImagePlane } from "./elements/ImagePlane"
import { useNozzleStore } from "@/stores/nozzle"


type ModelProps = {
  geometries: ManifoldGeometriesWithInfo[]
}

export default function Model({ geometries }: ModelProps) {
  const {width,height} = useNozzleStore()

  return (
    <group rotation={[0, 0, 0]}>
      {geometries.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry.geometry}
          rotation={[-Math.PI / 2, 0, 0]}>
          
            <meshStandardMaterial color={"pink"} flatShading={true} />
          
        </mesh>
      ))}
      
      <ImagePlane
        position={[0, 0, 1]}
        scale={1}
        width={width} // 例: 16:9のアスペクト比
        height={height}
      />
    </group>
  )
}
