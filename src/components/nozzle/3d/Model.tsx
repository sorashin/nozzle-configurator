import { GeometryWithId } from "@/stores/modular"
import { Box, MeshTransmissionMaterial, Plane } from "@react-three/drei"

import { ImagePlane } from "./elements/ImagePlane"
import { useNozzleStore } from "@/stores/nozzle"


type ModelProps = {
  geometries: GeometryWithId[]
}

export default function Model({ geometries }: ModelProps) {
  

  return (
    <group rotation={[0, 0, 0]}>
      {geometries.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry.geometry}
          rotation={[-Math.PI / 2, 0, 0]}>
          
            <meshStandardMaterial color={"#808080"} metalness={0.9} roughness={0.1} />
          
        </mesh>
      ))}
      
      
    </group>
  )
}
