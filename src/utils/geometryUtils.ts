
import {
    BufferAttribute,
    BufferGeometry,
    Matrix4,
    
  } from "three";
  
  // Modularの幾何学インターフェイスをThree.jsのBufferGeometryに変換
  const convertGeometryInterop = (interop: any, transform: number[]): BufferGeometry | null => {
    switch (interop?.variant) {
      case "Mesh": {
        const { data } = interop;
        const geometry = new BufferGeometry();
  
        const { vertices, normals, faces } = data;
        geometry.setAttribute(
          "position",
          new BufferAttribute(new Float32Array(vertices.flat(1)), 3)
        );
        geometry.setAttribute(
          "normal",
          new BufferAttribute(new Float32Array(normals.flat(1)), 3)
        );
        if (faces !== undefined) {
          geometry.setIndex(
            new BufferAttribute(new Uint32Array(faces.flat(1)), 1)
          );
        }
        geometry.applyMatrix4(new Matrix4().fromArray(transform));
  
        return geometry;
      }
      
      default:
        return null;
    }
  };


  export {convertGeometryInterop}