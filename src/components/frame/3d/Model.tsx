import { BufferGeometry } from "three"

type ModelProps = {
  geometries: BufferGeometry[]
}

export default function Model({ geometries }: ModelProps) {
  return (
    <group rotation={[0, 0, 0]}>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} rotation={[-Math.PI/2, 0, 0]}>
          <meshStandardMaterial color={"pink"} flatShading={true} />
        </mesh>
      ))}
    </group>
  )
}
