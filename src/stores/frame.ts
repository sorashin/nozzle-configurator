import { create } from 'zustand';

export type Mounting = "stand"|"wall";


interface FrameStore {
  // 状態
  type:number,
  width:number,
  height:number,
  mounting:Mounting,
  cover:number,
  thickness:number,
  backboard:number,
  updateFrame: (params: { type?: number, width?: number, height?: number, mounting?: Mounting, cover?: number, thickness?: number, backboard?: number }) => void;
  
}






// Zustand ストアを作成
export const useFrameStore = create<FrameStore>((set) => ({
  // 初期状態
  type:0,
  width:100,
  height:150,
  mounting:"stand",
  cover:0,
  thickness:0.3,
  backboard:3,
  updateFrame: (params) => set(params),
}));