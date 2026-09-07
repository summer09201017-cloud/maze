import type {
  Cell,
  Direction,
  GameProgress,
  GameSettings,
  GameState,
  LevelConfig,
  LevelProgress,
  MovementStrategy,
  ThemeName,
} from '../types';
import { generateMaze } from '../maze/generator';
import { createPlayer, resetPlayer, GridMovement, FreeMovement } from './player';
import { LEVELS, calculateStars } from './levels';
import { Renderer2D } from '../render/renderer2d';
import { KeyboardInput } from '../input/keyboard';
import { TouchInput } from '../input/touch';
import { SoundManager } from '../audio/sound';
import { HUD } from '../ui/hud';
import { getTheme } from '../themes';

const SETTINGS_KEY = 'maze-game-settings';
const PROGRESS_KEY = 'maze-game-progress-v2';
const HINT_DURATION = 4;

export class GameEngine {
  private renderer: Renderer2D;
  private keyboard: KeyboardInput;
  private touch: TouchInput;
  private sound: SoundManager;
  private hud: HUD;

  private state: GameState = 'menu';
  private maze: Cell[][] = [];
  private player = createPlayer();
  private movement!: MovementStrategy;

  private currentLevel = 0;
  private elapsedTime = 0;
  private exitRow = 0;
  private exitCol = 0;
  private minimapUnlocked = false;
  private minimapVisible = false;
  private minimapUnlockTimer = 0;
  private hintsRemaining = 0;
  private hintTimer = 0;

  private settings: GameSettings;
  private progress: GameProgress;
  private lastTime = 0;
  private animFrameId = 0;
  private warningTick = 0;
  private isTouchDevice: boolean;
  private readonly resizeHandler = (): void => this.handleResize();

  constructor(canvas: HTMLCanvasElement, container: HTMLElement) {
    this.settings = this.loadSettings();
    this.progress = this.loadProgress();

    this.renderer = new Renderer2D();
    this.renderer.init(canvas);
    this.renderer.setTheme(getTheme(this.settings.theme));
    this.applyThemeToDOM(this.settings.theme);

    this.keyboard = new KeyboardInput();
    this.keyboard.init();

    this.touch = new TouchInput();
    this.isTouchDevice = TouchInput.isTouchDevice();
    if (this.isTouchDevice) {
      this.touch.init(container);
      this.touch.hide();
    }

    this.sound = new SoundManager();
    this.sound.volume = this.settings.volume;
    this.sound.sfxOn = this.settings.sfxOn;

    this.hud = new HUD(container, this.settings);
    this.hud.updateProgress(this.progress);
    this.hud.setCallbacks({
      onStart: () => this.startGame(0),
      onResume: () => this.togglePause(),
      onRestart: () => this.restartLevel(),
      onMenu: () => this.goToMenu(),
      onNextLevel: () => this.nextLevel(),
      onSelectLevel: (level) => this.startGame(level - 1),
      onSettingsChange: (settings) => this.applySettings(settings),
      onToggleMinimap: () => this.toggleMinimap(),
      onUseHint: () => this.useHint(),
    });

    this.movement = this.settings.movementMode === 'grid'
      ? new GridMovement()
      : new FreeMovement();

    this.handleResize();
    window.addEventListener('resize', this.resizeHandler);

    const initAudio = () => {
      this.sound.init();
      this.sound.resume();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
  }

  start(): void {
    this.showMenu();
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  private showMenu(): void {
    this.state = 'menu';
    this.renderer.setTheme(getTheme(this.settings.theme));
    this.applyThemeToDOM(this.settings.theme);
    this.hud.updateProgress(this.progress);
    this.hud.showMenu();
    this.hud.hideHUD();
    this.hud.hideMinimapUnlock();
    if (this.isTouchDevice) this.touch.hide();
  }

  private startGame(levelIndex: number): void {
    const targetLevel = Math.max(0, Math.min(levelIndex, LEVELS.length - 1));
    if (!this.isLevelUnlocked(targetLevel)) {
      this.sound.playWarning();
      return;
    }

    this.currentLevel = targetLevel;
    this.setupLevel();
    this.state = 'playing';
    this.hud.hideOverlay();
    this.hud.showHUD();
    if (this.isTouchDevice) this.touch.show();
    this.sound.init();
    this.sound.resume();
    this.sound.playClick();
  }

  private setupLevel(): void {
    const config = LEVELS[this.currentLevel];
    this.renderer.setTheme(getTheme(config.theme));
    this.applyThemeToDOM(config.theme);

    this.maze = generateMaze(config.rows, config.cols);
    const exit = this.pickExit(config);
    this.exitRow = exit.row;
    this.exitCol = exit.col;

    resetPlayer(this.player);
    this.elapsedTime = 0;
    this.minimapUnlocked = false;
    this.minimapVisible = false;
    this.minimapUnlockTimer = 0;
    this.hintsRemaining = config.hintCount;
    this.hintTimer = 0;
    this.warningTick = 0;
    this.hud.hideMinimapUnlock();

    this.renderer.particles.clear();
    this.handleResize();
    this.updateHUD(config);
  }

  private restartLevel(): void {
    this.setupLevel();
    this.state = 'playing';
    this.hud.showHUD();
    if (this.isTouchDevice) this.touch.show();
    this.sound.playClick();
  }

  private nextLevel(): void {
    if (this.currentLevel < LEVELS.length - 1) {
      this.currentLevel++;
      this.setupLevel();
      this.state = 'playing';
      this.hud.showHUD();
      if (this.isTouchDevice) this.touch.show();
      this.sound.playClick();
    }
  }

  private togglePause(): void {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.hud.showPause();
      if (this.isTouchDevice) this.touch.hide();
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.hud.hideOverlay();
      if (this.isTouchDevice) this.touch.show();
    }
  }

  private goToMenu(): void {
    this.showMenu();
  }

  private toggleMinimap(): void {
    if (this.minimapUnlocked) {
      this.minimapVisible = !this.minimapVisible;
      this.sound.playUnlock();
    }
  }

  private useHint(): void {
    if (this.state !== 'playing' || this.hintsRemaining <= 0 || this.hintTimer > 0) return;

    this.hintsRemaining--;
    this.hintTimer = HINT_DURATION;
    this.sound.playUnlock();
    this.updateHUD(LEVELS[this.currentLevel]);
  }

  private applySettings(newSettings: GameSettings): void {
    this.settings = { ...newSettings };
    this.saveSettings();

    const activeTheme = this.state === 'playing' || this.state === 'paused'
      ? LEVELS[this.currentLevel].theme
      : this.settings.theme;
    this.renderer.setTheme(getTheme(activeTheme));
    this.applyThemeToDOM(activeTheme);

    this.movement = this.settings.movementMode === 'grid'
      ? new GridMovement()
      : new FreeMovement();

    this.sound.volume = this.settings.volume;
    this.sound.sfxOn = this.settings.sfxOn;

    this.hud.updateSettings(this.settings);
    this.sound.playClick();
  }

  private applyThemeToDOM(themeName: ThemeName): void {
    const theme = getTheme(themeName);
    document.documentElement.style.setProperty('--bg-color', theme.colors.background);
    document.documentElement.style.setProperty('--text-color', theme.colors.text);
    document.documentElement.style.setProperty('--accent-color', theme.colors.accent);
    document.documentElement.style.setProperty('--hud-bg', theme.colors.hud);
    document.documentElement.style.setProperty('--hud-text', theme.colors.hudText);
    document.documentElement.style.setProperty('--player-color', theme.colors.player);
    document.documentElement.style.setProperty('--font-family', theme.fontFamily);
  }

  private handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.resize(width, height);

    if (this.maze.length > 0) {
      const hudHeight = 54;
      const dpadHeight = this.isTouchDevice ? 160 : 0;
      this.renderer.calculateCellSize(
        this.maze,
        width,
        height - hudHeight - dpadHeight
      );
    }
  }

  private gameLoop = (timestamp: number): void => {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render(dt);

    this.animFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(dt: number): void {
    if (this.state !== 'playing') return;

    const config = LEVELS[this.currentLevel];
    this.elapsedTime += dt;
    this.hintTimer = Math.max(0, this.hintTimer - dt);

    if (config.timeLimit > 0 && this.elapsedTime >= config.timeLimit) {
      this.restartLevel();
      return;
    }

    if (config.timeLimit > 0) {
      const remaining = config.timeLimit - this.elapsedTime;
      if (remaining <= 10 && remaining > 0) {
        this.warningTick += dt;
        if (this.warningTick >= 1) {
          this.sound.playWarning();
          this.warningTick = 0;
        }
      }
    }

    if (this.keyboard.consumePause()) {
      this.togglePause();
      return;
    }

    let direction: Direction = this.keyboard.getDirection();
    if (!direction && this.isTouchDevice) {
      direction = this.touch.getDirection();
    }

    const moved = this.movement.update(
      this.player,
      direction,
      this.maze,
      dt,
      this.renderer.getCellSize()
    );

    if (moved) {
      this.sound.playMove();
    }

    this.updateHUD(config);

    if (!this.minimapUnlocked) {
      this.minimapUnlockTimer += dt;
      if (this.minimapUnlockTimer >= config.minimapUnlockTime) {
        this.minimapUnlocked = true;
        this.hud.showMinimapUnlock();
      }
    }

    if (this.hasReachedExit()) {
      this.onWin();
    }
  }

  private pickExit(config: LevelConfig): { row: number; col: number } {
    const exits = [
      { row: config.rows - 1, col: config.cols - 1 },
      { row: config.rows - 1, col: 0 },
      { row: 0, col: config.cols - 1 },
    ];
    return exits[Math.floor(Math.random() * exits.length)];
  }

  private hasReachedExit(): boolean {
    if (this.settings.movementMode === 'free') {
      const distance = Math.hypot(
        this.player.pixelX - this.exitCol,
        this.player.pixelY - this.exitRow
      );
      return distance <= 0.45;
    }

    return this.player.cellX === this.exitCol
      && this.player.cellY === this.exitRow
      && !this.player.isMoving;
  }

  private onWin(): void {
    // 📡 統計:完賽打點(index.html 的 psDone;沒有就靜默)
    (window as unknown as { psDone?: () => void }).psDone?.();
    this.state = 'won';
    const config = LEVELS[this.currentLevel];
    const stars = calculateStars(config, this.elapsedTime, this.player.steps);
    this.recordLevelResult(config, stars);

    this.sound.playWin();
    setTimeout(() => {
      for (let i = 0; i < stars; i++) {
        setTimeout(() => this.sound.playStar(), i * 300);
      }
    }, 500);

    const theme = getTheme(config.theme);
    this.renderer.particles.emitFireworks(
      this.exitCol + 0.5,
      this.exitRow + 0.5,
      [theme.colors.player, theme.colors.exit, theme.colors.accent, '#ffffff']
    );

    if (this.isTouchDevice) this.touch.hide();
    this.hud.hideMinimapUnlock();

    setTimeout(() => {
      if (this.currentLevel >= LEVELS.length - 1) {
        this.hud.showFinalWin(LEVELS.length);
      } else {
        this.hud.showWin(
          config.level,
          LEVELS.length,
          config.chapterName,
          this.elapsedTime,
          this.player.steps,
          stars
        );
      }
    }, 1500);
  }

  private render(dt: number): void {
    const config = LEVELS[this.currentLevel];

    if (this.maze.length === 0) {
      this.renderer.render(
        this.generateDecoMaze(),
        this.player,
        0, 0, 0, false, dt, false
      );
      return;
    }

    this.renderer.render(
      this.maze,
      this.player,
      this.exitRow,
      this.exitCol,
      config.fogRadius,
      this.minimapVisible,
      dt,
      this.hintTimer > 0
    );
  }

  private decoMaze: Cell[][] | null = null;
  private generateDecoMaze(): Cell[][] {
    if (!this.decoMaze) {
      this.decoMaze = generateMaze(5, 5);
    }
    return this.decoMaze;
  }

  private updateHUD(config: LevelConfig): void {
    this.hud.updateHUD(
      this.elapsedTime,
      config.level,
      LEVELS.length,
      this.player.steps,
      config.timeLimit,
      this.hintsRemaining,
      this.hintTimer > 0,
      config.chapterName
    );
  }

  private recordLevelResult(config: LevelConfig, stars: number): void {
    const record = this.ensureProgressRecord(config.level);
    record.unlocked = true;
    record.completed = true;
    record.stars = Math.max(record.stars, stars);
    record.bestTime = record.bestTime === null
      ? this.elapsedTime
      : Math.min(record.bestTime, this.elapsedTime);
    record.bestSteps = record.bestSteps === null
      ? this.player.steps
      : Math.min(record.bestSteps, this.player.steps);

    const nextLevel = LEVELS[this.currentLevel + 1];
    if (nextLevel) {
      this.ensureProgressRecord(nextLevel.level).unlocked = true;
    }

    this.saveProgress();
    this.hud.updateProgress(this.progress);
  }

  private isLevelUnlocked(levelIndex: number): boolean {
    const level = LEVELS[levelIndex];
    return this.ensureProgressRecord(level.level).unlocked;
  }

  private ensureProgressRecord(level: number): LevelProgress {
    if (!this.progress.levels[level]) {
      this.progress.levels[level] = this.createProgressRecord(level === 1);
    }
    return this.progress.levels[level];
  }

  private loadSettings(): GameSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...this.defaultSettings(), ...JSON.parse(saved) };
      }
    } catch { /* ignore broken settings */ }
    return this.defaultSettings();
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch { /* ignore storage errors */ }
  }

  private defaultSettings(): GameSettings {
    return {
      theme: 'cyberpunk',
      movementMode: 'grid',
      volume: 0.5,
      musicOn: true,
      sfxOn: true,
      touchMode: 'dpad',
    };
  }

  private loadProgress(): GameProgress {
    const progress = this.defaultProgress();
    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<GameProgress>;
        if (parsed.levels) {
          for (const level of LEVELS) {
            const savedRecord = parsed.levels[level.level];
            if (savedRecord) {
              progress.levels[level.level] = {
                ...progress.levels[level.level],
                ...savedRecord,
              };
            }
          }
        }
      }
    } catch { /* ignore broken progress */ }

    this.normalizeProgress(progress);
    return progress;
  }

  private saveProgress(): void {
    this.normalizeProgress(this.progress);
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progress));
    } catch { /* ignore storage errors */ }
  }

  private defaultProgress(): GameProgress {
    const levels: Record<number, LevelProgress> = {};
    for (const level of LEVELS) {
      levels[level.level] = this.createProgressRecord(level.level === 1);
    }
    return { levels };
  }

  private createProgressRecord(unlocked: boolean): LevelProgress {
    return {
      unlocked,
      completed: false,
      stars: 0,
      bestTime: null,
      bestSteps: null,
    };
  }

  private normalizeProgress(progress: GameProgress): void {
    for (let i = 0; i < LEVELS.length; i++) {
      const level = LEVELS[i];
      const record = progress.levels[level.level] ?? this.createProgressRecord(i === 0);
      record.unlocked = record.unlocked || i === 0;
      if (i > 0 && progress.levels[LEVELS[i - 1].level]?.completed) {
        record.unlocked = true;
      }
      progress.levels[level.level] = record;
    }
  }

  destroy(): void {
    cancelAnimationFrame(this.animFrameId);
    this.keyboard.destroy();
    this.touch.destroy();
    this.sound.destroy();
    this.renderer.destroy();
    this.hud.destroy();
    window.removeEventListener('resize', this.resizeHandler);
  }
}
