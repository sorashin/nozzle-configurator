import { create } from 'zustand';
type FlexSize = 'fill'|'1/2'|'1/3'|'fixed';

export type Row = {
  id: string;
  width: number;
  depth: number;
  type: FlexSize;
  // division: number;
  column: Column[];
};
export type Column ={
    id: string;
    depth: number;
    type: FlexSize;
}

// TrayStateとTrayActionsを一つのインターフェイスにまとめる
interface TrayStore {
  // 状態
  grid: Row[];
  totalWidth: number;
  totalDepth: number;
  totalHeight: number;
  isStack: boolean;
  fillet: number;
  edgeFillet: number;
  thickness: number;
  mm2pixel: number; // ミリメートルからピクセルへの変換係数
  selectedColumnId: string | null;
  
  // アクション
  addRow: (newRow: Omit<Row, 'width'>) => void;
  addColumn: (rowId: string) => void;
  removeColumn: (rowId: string, colId: string) => void; // 新しく追加するアクション
  updateRow: (id: string, updates: Partial<Row>) => void;
  updateSize: (params: { width?: number, depth?: number, height?: number }) => void;
  setSelectedColumnId: (id: string | null) => void;
  setIsStack: (isStack: boolean) => void;
  setThickness: (thickness: number) => void;
  setFillet: (fillet: number) => void;
}

interface FakeTrayStore{
  fakeTotalWidth: number;
  fakeTotalDepth: number;
  fakeTotalHeight: number;
  updateFakeSize: (params: { width?: number, depth?: number, height?: number }) => void;
}




// 幅と深さを再計算する共通ヘルパー関数
const recalculateRowDimensions = (rows: Row[], totalWidth: number, totalDepth: number, thickness: number): Row[] => {
  // 固定幅の合計を計算
  const fixedWidthSum = rows
    .filter(row => row.type === 'fixed')
    .reduce((sum, row) => sum + row.width, 0);
  
  // フレキシブル行に使える幅を計算
  const availableWidth = totalWidth - fixedWidthSum - (rows.length+1)*thickness;
  
  // フレキシブル行の種類をカウント
  const fillCount = rows.filter(row => row.type === 'fill').length;
  const halfCount = rows.filter(row => row.type === '1/2').length;
  const thirdCount = rows.filter(row => row.type === '1/3').length;
  
  // 幅の単位を計算
  const totalUnits = fillCount + (halfCount / 2) + (thirdCount / 3);
  const unitWidth = totalUnits > 0 ? availableWidth / totalUnits : 0;
  
  // 各行の深さを計算（厚みを考慮）
  const rowDepth = totalDepth - 2 * thickness;
  
  // 行の幅と深さを更新
  return rows.map(row => {
    let newWidth = row.width;
    // 固定幅でない場合のみ幅を再計算
    if (row.type !== 'fixed') {
      switch (row.type) {
        case 'fill':
          newWidth = unitWidth;
          break;
        case '1/2':
          newWidth = unitWidth / 2;
          break;
        case '1/3':
          newWidth = unitWidth / 3;
          break;
      }
      
      // 小数第2位で四捨五入
      newWidth = Math.round(newWidth * 100) / 100;
    }
    
    // 幅と深さの両方を更新して返す
    return { 
      ...row, 
      width: newWidth,
      depth: rowDepth
    };
  });
};

// 列の深さを再計算する共通ヘルパー関数
const recalculateColDimensions = (rows: Row[], thickness: number): Row[] => {
  // 各行について処理
  return rows.map(row => {
    // 固定幅の列の合計を計算
    const fixedDepthSum = row.column
      .filter(col => col.type === 'fixed')
      .reduce((sum, col) => sum + col.depth, 0);
    
    // フレキシブル列に使える深さを計算
    const availableDepth = row.depth - fixedDepthSum  - (row.column.length-1)*thickness;

    // フレキシブル列の種類をカウント
    const fillCount = row.column.filter(col => col.type === 'fill').length;
    const halfCount = row.column.filter(col => col.type === '1/2').length;
    const thirdCount = row.column.filter(col => col.type === '1/3').length;
    
    // 深さの単位を計算
    const totalUnits = fillCount + (halfCount / 2) + (thirdCount / 3);
    const unitDepth = totalUnits > 0 ? availableDepth / totalUnits : 0;
    
    // 列の深さを更新
    const updatedColumns = row.column.map(col => {
      let newDepth = col.depth;
      // 固定深さでない場合のみ深さを再計算
      if (col.type !== 'fixed') {
        switch (col.type) {
          case 'fill':
            newDepth = unitDepth;
            break;
          case '1/2':
            newDepth = unitDepth / 2;
            break;
          case '1/3':
            newDepth = unitDepth / 3;
            break;
        }
        
        // 小数第2位で四捨五入
        newDepth = Math.round(newDepth * 100) / 100;
      }
      
      // 深さを更新して返す
      return { 
        ...col, 
        depth: newDepth
      };
    });
    
    // 更新された列で行を更新
    return {
      ...row,
      column: updatedColumns
    };
  });
};

// ウィンドウサイズを取得するヘルパー関数
const getWindowSize = () => {
  if (typeof window === 'undefined') return { width: 1000, height: 800 };
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

// mm2pixelを計算するヘルパー関数
const calculateMm2Pixel = (width: number, depth: number) => {
  const { width: pixelSizeW, height: pixelSizeD } = getWindowSize();
  const screenScale = 2/3; // 画面の短辺に対して何割の大きさにするか
  // 大きい方の寸法に合わせてスケールを決定
  return width - depth > 0 ? pixelSizeW / width*screenScale : pixelSizeD / depth*screenScale;
};

// Zustand ストアを作成
export const useTrayStore = create<TrayStore>((set) => ({
  // 初期状態
  grid: [{
    id: 'row1',
    width: 96,
    depth: 96,
    type: 'fill',
    // division: 1,
    column: [{
      id: 'col1',
      depth: 96,
      type: 'fill'
    }]
  }],
  totalWidth: 100,
  totalDepth: 100,
  totalHeight: 20,
  isStack: false,
  fillet: 2,
  edgeFillet: 1,
  thickness: 2,
  mm2pixel: calculateMm2Pixel(100, 100), // 初期値を計算
  selectedColumnId: null,
  
  // アクション実装
  addRow: (newRow) => {
    set(state => {
      // 新しい行の幅を計算
      const rows = [...state.grid];
      const rowWithWidth = { 
        ...newRow, 
        width: newRow.type === 'fixed' ? 20 : 0 // 固定型のデフォルト幅、それ以外は再計算
      };
      rows.push(rowWithWidth);
      
      // 幅を再計算
      const updatedRows = recalculateRowDimensions(rows, state.totalWidth, state.totalDepth, state.thickness);
      
      // 列の深さを再計算
      const updatedRowsCols = recalculateColDimensions(updatedRows, state.thickness);
      
      // 負の幅をチェック
      if (updatedRowsCols.some(row => row.width < 0)) {
        alert('Cannot add row: negative width would occur');
        return state;
      }
      
      return {
        ...state,
        grid: updatedRowsCols
      };
    });
  },
  addColumn: (rowId) => {
    set(state => {
        // 行を検索
        const rowIndex = state.grid.findIndex(row => row.id === rowId);
        if (rowIndex === -1) return state;
        
        // 新しい列を追加
        const updatedRow = {
            ...state.grid[rowIndex],
            // division: state.grid[rowIndex].division + 1,
            column: [
                ...(state.grid[rowIndex].column || []),
                {
                    id: crypto.randomUUID(),
                    depth: state.grid[rowIndex].depth,
                    
                    type: 'fill' as FlexSize
                }
            ]
        };
        // 行を更新
        const updatedGrid = [...state.grid];
        updatedGrid[rowIndex] = updatedRow;
        
        // 列の深さを再計算
        const recalculatedGrid = recalculateColDimensions(updatedGrid, state.thickness);
        
        return {
            ...state,
            grid: recalculatedGrid
        };
    });
  },
  
  updateRow: (id, updates) => {
    set(state => {
      // 更新する行を検索
      const rowIndex = state.grid.findIndex(row => row.id === id);
      if (rowIndex === -1) return state;
      
      // 更新された行を含む新しい配列を作成
      const updatedGrid = [...state.grid];
      updatedGrid[rowIndex] = { ...updatedGrid[rowIndex], ...updates };
      
      // 必要に応じて幅を再計算
      const recalculatedRows = updates.width !== undefined || updates.type !== undefined || updates.column !== undefined
        ? recalculateRowDimensions(updatedGrid, state.totalWidth, state.totalDepth, state.thickness)
        : updatedGrid;
        
      // 必要に応じて列の深さを再計算
      const recalculatedRowsCols = updates.column !== undefined
        ? recalculateColDimensions(recalculatedRows, state.thickness)
        : recalculatedRows;

      // 負の幅をチェック
      if (recalculatedRowsCols.some(row => row.width < 0|| row.column.some(col => col.depth < 0))) {
        alert('Cannot update size: negative width would occur');
        return state;
      }
      
      return {
        ...state,
        grid: recalculatedRowsCols
      };
    });
  },
  
  updateSize: (params) => {
    set(state => {
      // 指定されていない値には現在の値を使用
      const width = params.width !== undefined ? params.width : state.totalWidth;
      const depth = params.depth !== undefined ? params.depth : state.totalDepth;
      const height = params.height !== undefined ? params.height : state.totalHeight;
      
      // 全体のサイズを更新
      const newState = {
        ...state,
        totalWidth: width,
        totalDepth: depth,
        totalHeight: height,
        mm2pixel: calculateMm2Pixel(width, depth) // mm2pixelを再計算
      };
      
      // 行の幅と深さを再計算
      const recalculatedRows = recalculateRowDimensions(state.grid, width, depth, state.thickness);
      
      // 列の深さを再計算
      const recalculatedRowsCols = recalculateColDimensions(recalculatedRows, state.thickness);

      // 負の幅をチェック
      if (recalculatedRowsCols.some(row => row.width < 0)) {
        alert('Cannot update size: negative width would occur');
        return state;
      }
      
      return {
        ...newState,
        grid: recalculatedRowsCols
      };
    });
  },
  removeColumn: (rowId, colId) => {
    set(state => {
      // 行を検索
      const rowIndex = state.grid.findIndex(row => row.id === rowId);
      const colIndex = state.grid[rowIndex].column.findIndex(col => col.id === colId);
      if (rowIndex === -1 || colIndex === -1) return state;

      // 行のdivisionが1の場合、行自体を削除する
      if (state.grid[rowIndex].column.length === 1) {
        // 直接行を削除するロジックを実装（removeRowを呼び出さない）
        const filteredGrid = state.grid.filter(row => row.id !== rowId);
        
        // 幅を再計算
        const recalculatedGrid = recalculateRowDimensions(filteredGrid, state.totalWidth, state.totalDepth, state.thickness);
        
        return {
          ...state,
          grid: recalculatedGrid
        };
      }else{
        // rowId,colIdが一致するcol要素を削除する
        const updatedRow = {
          ...state.grid[rowIndex],
          column: state.grid[rowIndex].column.filter(col => col.id !== colId)
        };
        // 行を更新
        const updatedGrid = [...state.grid];
        updatedGrid[rowIndex] = updatedRow;
        
        // 列の深さを再計算
        const recalculatedGrid = recalculateColDimensions(updatedGrid, state.thickness);
        
        return {
          ...state,
          grid: recalculatedGrid
        };
      }
      
    });
  },
  setSelectedColumnId: (id) => set(state => ({
    ...state,
    selectedColumnId: id
  })),
  setIsStack: (isStack) => set(state => ({
    ...state,
    isStack: isStack
  })),
  setThickness: (thickness) => set(state => {
    const newThickness = Math.round(thickness * 10) / 10;
    // 厚みが変更されたら行の幅と深さを再計算
    const recalculatedGrid = recalculateRowDimensions(state.grid, state.totalWidth, state.totalDepth, newThickness);
    // 列の深さも再計算
    const fullyRecalculatedGrid = recalculateColDimensions(recalculatedGrid, newThickness);
  
    return {
      ...state,
      thickness: newThickness,
      grid: fullyRecalculatedGrid
    };
  }),
  setFillet: (fillet) => set(state => {
    const newFillet = Math.round(fillet * 10) / 10;
    // フィレットが変更されたら行の寸法を再計算
    const recalculatedGrid = recalculateRowDimensions(state.grid, state.totalWidth, state.totalDepth, state.thickness);
    // 列の深さも再計算
    const fullyRecalculatedGrid = recalculateColDimensions(recalculatedGrid, state.thickness);
    
    return {
      ...state,
      fillet: newFillet,
      grid: fullyRecalculatedGrid
    };
  }),
  
}));

export const useFakeTrayStore = create<FakeTrayStore>((set) => ({
  fakeTotalWidth: 100,
  fakeTotalDepth: 100,
  fakeTotalHeight: 20,
  updateFakeSize: (params) => {
    set(state => ({
      ...state,
      fakeTotalWidth: params.width !== undefined ? params.width : state.fakeTotalWidth,
      fakeTotalDepth: params.depth !== undefined ? params.depth : state.fakeTotalDepth,
      fakeTotalHeight: params.height !== undefined ? params.height : state.fakeTotalHeight,
    }));
  }
}));