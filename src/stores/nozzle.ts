import { create } from 'zustand';

export type Mounting = "stand"|"wall";


interface NozzleStore {
  // 状態
  type:number,
  width:number,
  height:number,
  mounting:Mounting,
  cover:number,
  holeSize:number,
  nozzleSize:number,
  updateNozzle: (params: { type?: number, width?: number, height?: number, mounting?: Mounting, cover?: number, holeSize?: number, nozzleSize?: number }) => void;
  
}






// Zustand ストアを作成
export const useNozzleStore = create<NozzleStore>((set) => ({
  // 初期状態
  type:0,
  width:72,
  height:142,
  mounting:"stand",
  cover:0,
  holeSize:0.1,
  nozzleSize:3.5,
  updateNozzle: (params) => set(params),
}));