// ==========================================
// 2D Canvas 渲染器（支援 6 種主題切換）
// ==========================================

import type { Cell, Player, Theme } from '../types';
import { ParticleSystem } from './particles';

export class Renderer2D {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private theme!: Theme;
  private cellSize = 40;
  private width = 0;
  private height = 0;
  public particles = new ParticleSystem();

  // 動畫相關
  private time = 0;

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
  }

  resize(width: number, height: number): void {
    const dpr = window.devicePixelRatio || 1;
    this.width = width;
    this.height = height;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  getCellSize(): number {
    return this.cellSize;
  }

  calculateCellSize(maze: Cell[][], maxWidth: number, maxHeight: number): void {
    const rows = maze.length;
    const cols = maze[0].length;
    const padding = 20;
    this.cellSize = Math.floor(
      Math.min((maxWidth - padding * 2) / cols, (maxHeight - padding * 2) / rows)
    );
    this.cellSize = Math.max(20, Math.min(60, this.cellSize));
  }

  render(
    maze: Cell[][],
    player: Player,
    exitRow: number,
    exitCol: number,
    fogRadius: number,
    minimapUnlocked: boolean,
    dt: number,
    hintActive = false
  ): void {
    this.time += dt;
    const ctx = this.ctx;
    const { cellSize } = this;
    const rows = maze.length;
    const cols = maze[0].length;
    const mazeWidth = cols * cellSize;
    const mazeHeight = rows * cellSize;

    // 計算相機偏移（讓玩家居中）
    const playerPx = (player.isMoving ? player.pixelX : player.cellX) * cellSize + cellSize / 2;
    const playerPy = (player.isMoving ? player.pixelY : player.cellY) * cellSize + cellSize / 2;

    let offsetX = this.width / 2 - playerPx;
    let offsetY = this.height / 2 - playerPy;

    // 限制相機不超出迷宮邊界
    if (mazeWidth <= this.width) {
      offsetX = (this.width - mazeWidth) / 2;
    } else {
      offsetX = Math.min(10, Math.max(this.width - mazeWidth - 10, offsetX));
    }
    if (mazeHeight <= this.height) {
      offsetY = (this.height - mazeHeight) / 2;
    } else {
      offsetY = Math.min(10, Math.max(this.height - mazeHeight - 10, offsetY));
    }

    // 清空畫布
    ctx.fillStyle = this.theme.colors.background;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // 繪製通道底色
    this.drawPaths(ctx, maze, player, rows, cols);

    // 繪製走過的軌跡
    this.drawTrail(ctx, player);

    // 繪製出口
    this.drawExit(ctx, exitRow, exitCol);

    // 繪製牆壁
    this.drawWalls(ctx, maze, rows, cols);

    // 繪製玩家
    this.drawPlayer(ctx, player);

    // 繪製粒子
    this.particles.update(dt);
    this.particles.render(ctx, 0, 0, cellSize);

    // 出口粒子
    this.particles.emitExitGlow(
      exitCol + 0.5,
      exitRow + 0.5,
      this.theme.colors.exitPulse
    );

    // 繪製迷霧
    if (fogRadius > 0) {
      this.drawFog(ctx, player, fogRadius, mazeWidth, mazeHeight, rows, cols, hintActive);
    }

    if (hintActive) {
      this.drawHint(ctx, player, exitRow, exitCol);
    }

    ctx.restore();

    // 繪製迷你地圖
    if (minimapUnlocked) {
      this.drawMinimap(ctx, maze, player, exitRow, exitCol, rows, cols);
    }
  }

  private drawPaths(
    ctx: CanvasRenderingContext2D,
    _maze: Cell[][],
    player: Player,
    rows: number,
    cols: number
  ): void {
    const { cellSize } = this;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const explored = player.explored.has(`${c},${r}`);
        ctx.fillStyle = explored
          ? this.theme.colors.pathExplored
          : this.theme.colors.path;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }

  private drawTrail(ctx: CanvasRenderingContext2D, player: Player): void {
    const { cellSize } = this;
    const trailColor = this.theme.colors.trail;

    ctx.fillStyle = trailColor;
    const len = player.trail.length;
    for (let i = 0; i < len; i++) {
      const p = player.trail[i];
      const alpha = 0.3 + (i / len) * 0.5;
      ctx.globalAlpha = alpha;
      const r = cellSize * 0.12;
      ctx.beginPath();
      ctx.arc(
        p.x * cellSize + cellSize / 2,
        p.y * cellSize + cellSize / 2,
        r,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawExit(
    ctx: CanvasRenderingContext2D,
    exitRow: number,
    exitCol: number
  ): void {
    const { cellSize } = this;
    const cx = exitCol * cellSize + cellSize / 2;
    const cy = exitRow * cellSize + cellSize / 2;
    const pulse = Math.sin(this.time * 3) * 0.15 + 0.85;
    const r = cellSize * 0.3 * pulse;

    // 光暈
    if (this.theme.glowIntensity > 0) {
      ctx.save();
      ctx.shadowColor = this.theme.colors.exit;
      ctx.shadowBlur = this.theme.glowIntensity * 2;
      ctx.fillStyle = this.theme.colors.exitPulse;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 星形
    ctx.fillStyle = this.theme.colors.exit;
    this.drawStar(ctx, cx, cy, r, 5);
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    points: number
  ): void {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.5;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  private drawWalls(
    ctx: CanvasRenderingContext2D,
    maze: Cell[][],
    rows: number,
    cols: number
  ): void {
    const { cellSize } = this;
    const colors = this.theme.colors;

    ctx.strokeStyle = colors.wall;
    ctx.lineWidth = this.theme.wallWidth;
    ctx.lineCap = 'round';

    if (this.theme.glowIntensity > 0) {
      ctx.shadowColor = colors.wallGlow;
      ctx.shadowBlur = this.theme.glowIntensity;
    }

    ctx.beginPath();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = maze[r][c];
        const x = c * cellSize;
        const y = r * cellSize;

        if (cell.walls.top) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y);
        }
        if (cell.walls.right) {
          ctx.moveTo(x + cellSize, y);
          ctx.lineTo(x + cellSize, y + cellSize);
        }
        if (cell.walls.bottom) {
          ctx.moveTo(x, y + cellSize);
          ctx.lineTo(x + cellSize, y + cellSize);
        }
        if (cell.walls.left) {
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + cellSize);
        }
      }
    }
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
    const { cellSize } = this;
    const px = (player.isMoving ? player.pixelX : player.cellX) * cellSize + cellSize / 2;
    const py = (player.isMoving ? player.pixelY : player.cellY) * cellSize + cellSize / 2;
    const r = cellSize * this.theme.playerRadius;

    // 光暈脈動
    const glowPulse = Math.sin(this.time * 4) * 0.3 + 0.7;

    if (this.theme.glowIntensity > 0) {
      ctx.save();
      ctx.shadowColor = this.theme.colors.player;
      ctx.shadowBlur = this.theme.glowIntensity * glowPulse;
      ctx.fillStyle = this.theme.colors.playerGlow;
      ctx.beginPath();
      ctx.arc(px, py, r * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 玩家本體
    ctx.fillStyle = this.theme.colors.player;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();

    // 內部高光
    ctx.fillStyle = '#ffffff44';
    ctx.beginPath();
    ctx.arc(px - r * 0.2, py - r * 0.2, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 移動時生成尾跡粒子
    if (player.isMoving) {
      this.particles.emitTrail(
        player.pixelX + 0.5,
        player.pixelY + 0.5,
        this.theme.particles.color
      );
    }
  }

  private drawFog(
    ctx: CanvasRenderingContext2D,
    player: Player,
    fogRadius: number,
    mazeWidth: number,
    mazeHeight: number,
    rows: number,
    cols: number,
    hintActive: boolean
  ): void {
    const { cellSize } = this;
    const px = (player.isMoving ? player.pixelX : player.cellX) * cellSize + cellSize / 2;
    const py = (player.isMoving ? player.pixelY : player.cellY) * cellSize + cellSize / 2;
    const fogR = (hintActive ? fogRadius + 1.2 : fogRadius) * cellSize;
    const clearR = fogR * 0.62;

    ctx.save();
    ctx.fillStyle = this.theme.colors.fog;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * cellSize + cellSize / 2;
        const cy = r * cellSize + cellSize / 2;
        const distance = Math.hypot(cx - px, cy - py);
        if (distance <= clearR) continue;

        const explored = player.explored.has(`${c},${r}`);
        const maxAlpha = explored ? 0.56 : 0.97;
        const edgeAlpha = distance < fogR
          ? ((distance - clearR) / (fogR - clearR)) * maxAlpha
          : maxAlpha;

        ctx.globalAlpha = Math.max(0, Math.min(maxAlpha, edgeAlpha));
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }

    ctx.globalAlpha = 1;
    ctx.fillRect(-cellSize, -cellSize, mazeWidth + cellSize * 2, cellSize);
    ctx.fillRect(-cellSize, mazeHeight, mazeWidth + cellSize * 2, cellSize);
    ctx.fillRect(-cellSize, 0, cellSize, mazeHeight);
    ctx.fillRect(mazeWidth, 0, cellSize, mazeHeight);

    ctx.restore();
  }

  private drawHint(
    ctx: CanvasRenderingContext2D,
    player: Player,
    exitRow: number,
    exitCol: number
  ): void {
    const { cellSize } = this;
    const px = (player.isMoving ? player.pixelX : player.cellX) * cellSize + cellSize / 2;
    const py = (player.isMoving ? player.pixelY : player.cellY) * cellSize + cellSize / 2;
    const exitX = exitCol * cellSize + cellSize / 2;
    const exitY = exitRow * cellSize + cellSize / 2;
    const angle = Math.atan2(exitY - py, exitX - px);
    const pulse = Math.sin(this.time * 8) * 0.18 + 0.82;
    const length = cellSize * 1.65;
    const start = cellSize * 0.65;
    const x1 = px + Math.cos(angle) * start;
    const y1 = py + Math.sin(angle) * start;
    const x2 = px + Math.cos(angle) * length;
    const y2 = py + Math.sin(angle) * length;

    ctx.save();
    ctx.globalAlpha = 0.85 * pulse;
    ctx.strokeStyle = this.theme.colors.exit;
    ctx.fillStyle = this.theme.colors.exit;
    ctx.lineWidth = Math.max(3, cellSize * 0.08);
    ctx.lineCap = 'round';
    ctx.shadowColor = this.theme.colors.exitPulse;
    ctx.shadowBlur = this.theme.glowIntensity + 8;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const arrowSize = cellSize * 0.22;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - Math.cos(angle - Math.PI / 6) * arrowSize,
      y2 - Math.sin(angle - Math.PI / 6) * arrowSize
    );
    ctx.lineTo(
      x2 - Math.cos(angle + Math.PI / 6) * arrowSize,
      y2 - Math.sin(angle + Math.PI / 6) * arrowSize
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawMinimap(
    ctx: CanvasRenderingContext2D,
    maze: Cell[][],
    player: Player,
    exitRow: number,
    exitCol: number,
    rows: number,
    cols: number
  ): void {
    const mapSize = Math.min(120, this.width * 0.2);
    const mapCellSize = mapSize / Math.max(rows, cols);
    const mapX = this.width - mapSize - 15;
    const mapY = 50;
    const mapW = cols * mapCellSize;
    const mapH = rows * mapCellSize;

    // 背景
    ctx.fillStyle = this.theme.colors.hud;
    ctx.strokeStyle = this.theme.colors.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(mapX - 5, mapY - 5, mapW + 10, mapH + 10, 5);
    ctx.fill();
    ctx.stroke();

    // 標題
    ctx.fillStyle = this.theme.colors.hudText;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🗺️', mapX + mapW / 2, mapY - 10);

    // 繪製已探索區域
    ctx.fillStyle = this.theme.colors.pathExplored;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (player.explored.has(`${c},${r}`)) {
          ctx.fillRect(
            mapX + c * mapCellSize,
            mapY + r * mapCellSize,
            mapCellSize,
            mapCellSize
          );
        }
      }
    }

    // 繪製牆壁
    ctx.strokeStyle = this.theme.colors.wall;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!player.explored.has(`${c},${r}`)) continue;

        const cell = maze[r][c];
        const x = mapX + c * mapCellSize;
        const y = mapY + r * mapCellSize;
        if (cell.walls.top) { ctx.moveTo(x, y); ctx.lineTo(x + mapCellSize, y); }
        if (cell.walls.right) { ctx.moveTo(x + mapCellSize, y); ctx.lineTo(x + mapCellSize, y + mapCellSize); }
        if (cell.walls.bottom) { ctx.moveTo(x, y + mapCellSize); ctx.lineTo(x + mapCellSize, y + mapCellSize); }
        if (cell.walls.left) { ctx.moveTo(x, y); ctx.lineTo(x, y + mapCellSize); }
      }
    }
    ctx.stroke();

    if (player.explored.has(`${exitCol},${exitRow}`)) {
      ctx.fillStyle = this.theme.colors.exit;
      ctx.fillRect(
        mapX + exitCol * mapCellSize,
        mapY + exitRow * mapCellSize,
        mapCellSize,
        mapCellSize
      );
    }

    // 玩家
    ctx.fillStyle = this.theme.colors.player;
    ctx.fillRect(
      mapX + player.cellX * mapCellSize,
      mapY + player.cellY * mapCellSize,
      mapCellSize,
      mapCellSize
    );
  }

  destroy(): void {
    this.particles.clear();
  }
}
