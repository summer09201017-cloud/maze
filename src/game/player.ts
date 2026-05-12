// ==========================================
// 玩家邏輯 + 兩種移動策略
// ==========================================

import type { Cell, Direction, Player, MovementStrategy } from '../types';

/** 建立初始玩家 */
export function createPlayer(): Player {
  return {
    cellX: 0,
    cellY: 0,
    pixelX: 0,
    pixelY: 0,
    moveProgress: 1,
    isMoving: false,
    fromCellX: 0,
    fromCellY: 0,
    trail: [],
    steps: 0,
    explored: new Set(['0,0']),
  };
}

/** 重置玩家到起點 */
export function resetPlayer(player: Player): void {
  player.cellX = 0;
  player.cellY = 0;
  player.pixelX = 0;
  player.pixelY = 0;
  player.moveProgress = 1;
  player.isMoving = false;
  player.fromCellX = 0;
  player.fromCellY = 0;
  player.trail = [];
  player.steps = 0;
  player.explored = new Set(['0,0']);
}

// ==========================================
// 格子式移動策略
// ==========================================
export class GridMovement implements MovementStrategy {
  private moveSpeed = 8; // 每秒移動幾格（動畫速度）
  private holdTimer = 0;
  private holdDelay = 0.15; // 按住後連續移動的延遲（秒）
  private lastDirection: Direction = null;
  private canMove = true;

  update(
    player: Player,
    direction: Direction,
    maze: Cell[][],
    dt: number,
    _cellSize: number
  ): boolean {
    let moved = false;

    // 更新移動動畫
    if (player.isMoving) {
      player.moveProgress += dt * this.moveSpeed;
      if (player.moveProgress >= 1) {
        player.moveProgress = 1;
        player.isMoving = false;
        player.pixelX = player.cellX;
        player.pixelY = player.cellY;
      } else {
        // 使用 easeOutQuad 平滑動畫
        const t = 1 - (1 - player.moveProgress) * (1 - player.moveProgress);
        player.pixelX = player.fromCellX + (player.cellX - player.fromCellX) * t;
        player.pixelY = player.fromCellY + (player.cellY - player.fromCellY) * t;
      }
      return false;
    }

    // 處理按住連續移動
    if (direction === this.lastDirection && direction !== null) {
      this.holdTimer += dt;
      if (this.holdTimer < this.holdDelay) {
        if (!this.canMove) return false;
      }
    } else {
      this.holdTimer = 0;
      this.canMove = true;
    }
    this.lastDirection = direction;

    // 嘗試移動
    if (direction && this.canMove) {
      const { cellX, cellY } = player;
      const cell = maze[cellY]?.[cellX];
      if (!cell) return false;

      let newX = cellX;
      let newY = cellY;

      switch (direction) {
        case 'up':
          if (!cell.walls.top) newY--;
          break;
        case 'down':
          if (!cell.walls.bottom) newY++;
          break;
        case 'left':
          if (!cell.walls.left) newX--;
          break;
        case 'right':
          if (!cell.walls.right) newX++;
          break;
      }

      if (newX !== cellX || newY !== cellY) {
        // 開始移動動畫
        player.fromCellX = player.cellX;
        player.fromCellY = player.cellY;
        player.cellX = newX;
        player.cellY = newY;
        player.moveProgress = 0;
        player.isMoving = true;
        player.steps++;
        player.trail.push({ x: cellX, y: cellY });
        player.explored.add(`${newX},${newY}`);
        moved = true;
        this.canMove = false;
      }
    }

    if (direction === null) {
      this.canMove = true;
    }

    return moved;
  }
}

// ==========================================
// 自由像素移動策略
// ==========================================
export class FreeMovement implements MovementStrategy {
  private speed = 5; // 每秒移動幾格

  update(
    player: Player,
    direction: Direction,
    maze: Cell[][],
    dt: number,
    _cellSize: number
  ): boolean {
    if (!direction) return false;

    const moveAmount = this.speed * dt;
    let newPixelX = player.pixelX;
    let newPixelY = player.pixelY;

    switch (direction) {
      case 'up': newPixelY -= moveAmount; break;
      case 'down': newPixelY += moveAmount; break;
      case 'left': newPixelX -= moveAmount; break;
      case 'right': newPixelX += moveAmount; break;
    }

    // AABB 碰撞偵測
    const radius = 0.35;
    const rows = maze.length;
    const cols = maze[0].length;

    // 檢查四個角的碰撞
    if (this.canMoveTo(newPixelX, newPixelY, radius, maze, rows, cols)) {
      const oldCellX = Math.floor(player.pixelX + 0.5);
      const oldCellY = Math.floor(player.pixelY + 0.5);

      player.pixelX = newPixelX;
      player.pixelY = newPixelY;
      player.cellX = Math.floor(newPixelX + 0.5);
      player.cellY = Math.floor(newPixelY + 0.5);
      player.cellX = Math.max(0, Math.min(cols - 1, player.cellX));
      player.cellY = Math.max(0, Math.min(rows - 1, player.cellY));

      if (player.cellX !== oldCellX || player.cellY !== oldCellY) {
        player.steps++;
        player.trail.push({ x: oldCellX, y: oldCellY });
        player.explored.add(`${player.cellX},${player.cellY}`);
      }

      player.isMoving = true;
      player.moveProgress = 1;
      return true;
    }

    return false;
  }

  private canMoveTo(
    px: number,
    py: number,
    radius: number,
    maze: Cell[][],
    rows: number,
    cols: number
  ): boolean {
    // 檢查是否在迷宮範圍內
    if (px - radius < -0.5 || px + radius > cols - 0.5) return false;
    if (py - radius < -0.5 || py + radius > rows - 0.5) return false;

    // 檢查與牆壁的碰撞
    const cellX = Math.floor(px + 0.5);
    const cellY = Math.floor(py + 0.5);

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = cellX + dx;
        const cy = cellY + dy;
        if (cx < 0 || cx >= cols || cy < 0 || cy >= rows) continue;

        const cell = maze[cy][cx];
        // 檢查每面牆壁
        if (cell.walls.top && py - radius < cy - 0.5 && py + radius > cy - 0.5 &&
            px + radius > cx - 0.5 && px - radius < cx + 0.5) return false;
        if (cell.walls.bottom && py - radius < cy + 0.5 && py + radius > cy + 0.5 &&
            px + radius > cx - 0.5 && px - radius < cx + 0.5) return false;
        if (cell.walls.left && px - radius < cx - 0.5 && px + radius > cx - 0.5 &&
            py + radius > cy - 0.5 && py - radius < cy + 0.5) return false;
        if (cell.walls.right && px - radius < cx + 0.5 && px + radius > cx + 0.5 &&
            py + radius > cy - 0.5 && py - radius < cy + 0.5) return false;
      }
    }

    return true;
  }
}
