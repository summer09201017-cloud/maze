// ==========================================
// 2D 迷宮遊戲 — 核心型別定義
// ==========================================

/** 迷宮格子 */
export interface Cell {
  row: number;
  col: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
}

/** 座標點 */
export interface Point {
  x: number;
  y: number;
}

/** 玩家 */
export interface Player {
  /** 格子座標 */
  cellX: number;
  cellY: number;
  /** Canvas 像素座標（用於動畫插值） */
  pixelX: number;
  pixelY: number;
  /** 移動動畫進度 0~1 */
  moveProgress: number;
  /** 是否正在移動動畫中 */
  isMoving: boolean;
  /** 移動起點（格子座標） */
  fromCellX: number;
  fromCellY: number;
  /** 走過的路徑 */
  trail: Point[];
  /** 步數 */
  steps: number;
  /** 探索過的格子 */
  explored: Set<string>;
}

/** 遊戲狀態 */
export type GameState = 'menu' | 'playing' | 'paused' | 'won' | 'transitioning' | 'settings' | 'levelSelect';

/** 方向 */
export type Direction = 'up' | 'down' | 'left' | 'right' | null;

/** 移動模式 */
export type MovementMode = 'grid' | 'free';

/** 主題名稱 */
export type ThemeName = 'cyberpunk' | 'forest' | 'dungeon' | 'minimal' | 'retro' | 'space';

/** 主題色彩 */
export interface ThemeColors {
  background: string;
  wall: string;
  wallGlow: string;
  path: string;
  pathExplored: string;
  player: string;
  playerGlow: string;
  trail: string;
  exit: string;
  exitPulse: string;
  fog: string;
  text: string;
  accent: string;
  hud: string;
  hudText: string;
}

/** 粒子配置 */
export interface ParticleConfig {
  color: string;
  glowColor: string;
  count: number;
  speed: number;
  size: number;
}

/** 主題定義 */
export interface Theme {
  name: string;
  displayName: string;
  emoji: string;
  colors: ThemeColors;
  wallWidth: number;
  playerRadius: number;
  glowIntensity: number;
  particles: ParticleConfig;
  fontFamily: string;
}

/** 關卡配置 */
export interface LevelConfig {
  level: number;
  chapterName: string;
  theme: ThemeName;
  rows: number;
  cols: number;
  /** 迷霧可視半徑（格子數），0 = 無迷霧 */
  fogRadius: number;
  /** 限時（秒），0 = 無限 */
  timeLimit: number;
  /** 3 星時間門檻（秒） */
  star3Time: number;
  /** 2 星時間門檻（秒） */
  star2Time: number;
  /** 3 星步數門檻 */
  star3Steps: number;
  /** 2 星步數門檻 */
  star2Steps: number;
  /** 解鎖迷你地圖所需時間（秒） */
  minimapUnlockTime: number;
  hintCount: number;
}

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  stars: number;
  bestTime: number | null;
  bestSteps: number | null;
}

export interface GameProgress {
  levels: Record<number, LevelProgress>;
}

/** 遊戲設定（存 localStorage） */
export interface GameSettings {
  theme: ThemeName;
  movementMode: MovementMode;
  volume: number;
  musicOn: boolean;
  sfxOn: boolean;
  touchMode: 'dpad' | 'swipe';
}

/** 星級評價 */
export interface StarRating {
  stars: number; // 1-3
  timeTaken: number;
  steps: number;
}

/** 渲染器介面（Phase 2 預留） */
export interface MazeRenderer {
  init(canvas: HTMLCanvasElement): void;
  setTheme(theme: Theme): void;
  render(
    maze: Cell[][],
    player: Player,
    exitRow: number,
    exitCol: number,
    fogRadius: number,
    minimapUnlocked: boolean,
    time: number,
    hintActive?: boolean
  ): void;
  resize(width: number, height: number): void;
  getCellSize(): number;
  destroy(): void;
}

/** 移動策略介面 */
export interface MovementStrategy {
  update(
    player: Player,
    direction: Direction,
    maze: Cell[][],
    dt: number,
    cellSize: number
  ): boolean; // 回傳是否成功移動
}

/** 粒子 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}
