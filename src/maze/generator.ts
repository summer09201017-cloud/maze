// ==========================================
// DFS 迷宮生成器（迭代式，避免 stack overflow）
// ==========================================

import type { Cell } from '../types';

/** 方向定義：[dRow, dCol, 當前牆壁方向, 對面牆壁方向] */
const DIRECTIONS: [number, number, keyof Cell['walls'], keyof Cell['walls']][] = [
  [-1, 0, 'top', 'bottom'],
  [1, 0, 'bottom', 'top'],
  [0, -1, 'left', 'right'],
  [0, 1, 'right', 'left'],
];

/** Fisher-Yates 洗牌 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 使用 DFS 迭代式回溯法生成迷宮
 * @param rows 行數
 * @param cols 列數
 * @returns 二維 Cell 陣列
 */
export function generateMaze(rows: number, cols: number): Cell[][] {
  // 初始化網格：所有牆壁都存在
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = {
        row: r,
        col: c,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
      };
    }
  }

  // 迭代式 DFS（使用 stack）
  const stack: Cell[] = [];
  const start = grid[0][0];
  start.visited = true;
  stack.push(start);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    // 找出未訪問的鄰居
    const unvisitedNeighbors: {
      cell: Cell;
      wallKey: keyof Cell['walls'];
      oppositeKey: keyof Cell['walls'];
    }[] = [];

    for (const [dr, dc, wallKey, oppositeKey] of shuffle(DIRECTIONS)) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].visited) {
        unvisitedNeighbors.push({
          cell: grid[nr][nc],
          wallKey,
          oppositeKey,
        });
      }
    }

    if (unvisitedNeighbors.length > 0) {
      // 隨機選一個鄰居
      const chosen = unvisitedNeighbors[0]; // 已經打亂順序了
      // 打掉中間的牆
      current.walls[chosen.wallKey] = false;
      chosen.cell.walls[chosen.oppositeKey] = false;
      // 標記訪問並壓入 stack
      chosen.cell.visited = true;
      stack.push(chosen.cell);
    } else {
      // 回溯
      stack.pop();
    }
  }

  // 重置 visited（給遊戲邏輯用）
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid[r][c].visited = false;
    }
  }

  return grid;
}
