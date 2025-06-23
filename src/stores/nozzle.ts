import { create } from 'zustand';

export type Mounting = "stand"|"wall";


interface NozzleStore {
  // 状態
  type:number,
  width:number,
  height:number,
  mounting:Mounting,
  cover:number,
  thickness:number,
  backboard:number,
  updateNozzle: (params: { type?: number, width?: number, height?: number, mounting?: Mounting, cover?: number, thickness?: number, backboard?: number }) => void;
  
}






// Zustand ストアを作成
export const useNozzleStore = create<NozzleStore>((set) => ({
  // 初期状態
  type:0,
  width:72,
  height:142,
  mounting:"stand",
  cover:0,
  thickness:0.3,
  backboard:3,
  updateNozzle: (params) => set(params),
}));