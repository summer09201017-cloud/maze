import type { GameProgress, GameSettings, LevelProgress, ThemeName } from '../types';
import { LEVELS } from '../game/levels';
import { THEME_NAMES, THEMES } from '../themes';

type UICallback = {
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onNextLevel: () => void;
  onSelectLevel: (level: number) => void;
  onSettingsChange: (settings: GameSettings) => void;
  onToggleMinimap: () => void;
  onUseHint: () => void;
};

export class HUD {
  private container: HTMLElement;
  private callbacks!: UICallback;
  private settings: GameSettings;
  private progress: GameProgress | null = null;
  private hudBar!: HTMLElement;
  private overlay!: HTMLElement;
  private minimapBtn!: HTMLButtonElement;
  private hintBtn!: HTMLButtonElement;
  private timeDisplay!: HTMLElement;
  private levelDisplay!: HTMLElement;
  private chapterDisplay!: HTMLElement;
  private stepsDisplay!: HTMLElement;
  private hintValue!: HTMLElement;
  private timerWarning = false;

  constructor(container: HTMLElement, settings: GameSettings) {
    this.container = container;
    this.settings = { ...settings };
    this.createElements();
  }

  setCallbacks(callbacks: UICallback): void {
    this.callbacks = callbacks;
  }

  updateProgress(progress: GameProgress): void {
    this.progress = progress;
  }

  private createElements(): void {
    this.hudBar = document.createElement('div');
    this.hudBar.id = 'hud-bar';
    this.hudBar.className = 'hud-bar hidden';
    this.hudBar.innerHTML = `
      <div class="hud-item" id="hud-time">
        <span class="hud-icon">⏱</span>
        <span class="hud-value" id="time-value">00:00</span>
      </div>
      <div class="hud-item hud-level" id="hud-level">
        <span class="hud-icon">◇</span>
        <span class="hud-value" id="level-value">1/${LEVELS.length}</span>
        <span class="hud-detail" id="chapter-value"></span>
      </div>
      <div class="hud-item" id="hud-steps">
        <span class="hud-icon">↟</span>
        <span class="hud-value" id="steps-value">0</span>
      </div>
      <button class="hud-btn hint-btn" id="hint-btn" aria-label="使用提示">
        <span>💡</span><span id="hint-value">0</span>
      </button>
      <button class="hud-btn" id="pause-btn" aria-label="暫停">Ⅱ</button>
    `;
    this.container.appendChild(this.hudBar);

    this.timeDisplay = this.hudBar.querySelector('#time-value')!;
    this.levelDisplay = this.hudBar.querySelector('#level-value')!;
    this.chapterDisplay = this.hudBar.querySelector('#chapter-value')!;
    this.stepsDisplay = this.hudBar.querySelector('#steps-value')!;
    this.hintBtn = this.hudBar.querySelector('#hint-btn') as HTMLButtonElement;
    this.hintValue = this.hudBar.querySelector('#hint-value')!;

    this.hudBar.querySelector('#pause-btn')!.addEventListener('click', () => {
      this.callbacks?.onResume?.();
    });
    this.hintBtn.addEventListener('click', () => {
      this.callbacks?.onUseHint?.();
    });

    this.minimapBtn = document.createElement('button');
    this.minimapBtn.id = 'minimap-unlock-btn';
    this.minimapBtn.className = 'minimap-unlock-btn hidden';
    this.minimapBtn.textContent = '開啟小地圖';
    this.minimapBtn.addEventListener('click', () => {
      this.callbacks?.onToggleMinimap();
    });
    this.container.appendChild(this.minimapBtn);

    this.overlay = document.createElement('div');
    this.overlay.id = 'overlay';
    this.overlay.className = 'overlay hidden';
    this.container.appendChild(this.overlay);
  }

  updateHUD(
    time: number,
    level: number,
    totalLevels: number,
    steps: number,
    timeLimit: number,
    hintsRemaining: number,
    hintActive: boolean,
    chapterName: string
  ): void {
    this.timeDisplay.textContent = this.formatTime(time);
    this.levelDisplay.textContent = `${level}/${totalLevels}`;
    this.chapterDisplay.textContent = chapterName;
    this.stepsDisplay.textContent = `${steps}`;
    this.hintValue.textContent = `${hintsRemaining}`;
    this.hintBtn.disabled = hintsRemaining <= 0 || hintActive;
    this.hintBtn.classList.toggle('active', hintActive);

    if (timeLimit > 0) {
      const remaining = timeLimit - time;
      if (remaining <= 10 && remaining > 0) {
        this.timeDisplay.classList.add('warning');
        this.timerWarning = true;
      } else {
        this.timeDisplay.classList.remove('warning');
        this.timerWarning = false;
      }
    } else {
      this.timeDisplay.classList.remove('warning');
      this.timerWarning = false;
    }
  }

  get isTimerWarning(): boolean { return this.timerWarning; }

  showMinimapUnlock(): void {
    this.minimapBtn.classList.remove('hidden');
  }

  hideMinimapUnlock(): void {
    this.minimapBtn.classList.add('hidden');
  }

  showMenu(): void {
    this.hudBar.classList.add('hidden');
    this.overlay.classList.remove('hidden');
    const completed = this.getCompletedCount();
    this.overlay.innerHTML = `
      <div class="menu-container">
        <h1 class="game-title">迷霧迷宮</h1>
        <p class="game-subtitle">Maze Adventure</p>
        <p class="progress-summary">已完成 ${completed}/${LEVELS.length} 關</p>
        <div class="menu-buttons">
          <button class="menu-btn primary" id="start-btn">開始冒險</button>
          <button class="menu-btn" id="level-select-btn">選擇關卡</button>
          <button class="menu-btn" id="settings-btn">設定</button>
        </div>
        <div class="menu-footer">
          <span>WASD / 方向鍵移動 · ESC 暫停</span>
        </div>
      </div>
    `;

    this.overlay.querySelector('#start-btn')!.addEventListener('click', () => {
      this.callbacks.onStart();
    });
    this.overlay.querySelector('#level-select-btn')!.addEventListener('click', () => {
      this.showLevelSelect();
    });
    this.overlay.querySelector('#settings-btn')!.addEventListener('click', () => {
      this.showSettings();
    });
  }

  showPause(): void {
    this.overlay.classList.remove('hidden');
    this.overlay.innerHTML = `
      <div class="menu-container">
        <h2 class="pause-title">暫停</h2>
        <div class="menu-buttons">
          <button class="menu-btn primary" id="resume-btn">繼續</button>
          <button class="menu-btn" id="restart-btn">重新開始</button>
          <button class="menu-btn" id="settings-btn2">設定</button>
          <button class="menu-btn danger" id="menu-btn">回主選單</button>
        </div>
      </div>
    `;

    this.overlay.querySelector('#resume-btn')!.addEventListener('click', () => {
      this.hideOverlay();
      this.callbacks.onResume();
    });
    this.overlay.querySelector('#restart-btn')!.addEventListener('click', () => {
      this.hideOverlay();
      this.callbacks.onRestart();
    });
    this.overlay.querySelector('#settings-btn2')!.addEventListener('click', () => {
      this.showSettings();
    });
    this.overlay.querySelector('#menu-btn')!.addEventListener('click', () => {
      this.callbacks.onMenu();
    });
  }

  showWin(level: number, totalLevels: number, chapterName: string, time: number, steps: number, stars: number): void {
    this.overlay.classList.remove('hidden');
    const record = this.getLevelProgress(level);
    const starDisplay = this.renderStars(stars);

    this.overlay.innerHTML = `
      <div class="menu-container win-container">
        <h2 class="win-title">通關成功</h2>
        <p class="win-chapter">${chapterName} · 第 ${level} 關</p>
        <div class="win-stats">
          <div class="star-display">${starDisplay}</div>
          <div class="stat-row"><span>時間</span><span>${this.formatTime(time)}</span></div>
          <div class="stat-row"><span>步數</span><span>${steps}</span></div>
          <div class="stat-row"><span>最佳時間</span><span>${this.formatRecordTime(record)}</span></div>
          <div class="stat-row"><span>最佳步數</span><span>${this.formatRecordSteps(record)}</span></div>
          <div class="stat-row"><span>關卡</span><span>${level}/${totalLevels}</span></div>
        </div>
        <div class="menu-buttons">
          ${level < totalLevels ? '<button class="menu-btn primary" id="next-btn">下一關</button>' : ''}
          <button class="menu-btn" id="replay-btn">再玩一次</button>
          <button class="menu-btn" id="menu-btn2">回主選單</button>
        </div>
      </div>
    `;

    if (level < totalLevels) {
      this.overlay.querySelector('#next-btn')!.addEventListener('click', () => {
        this.hideOverlay();
        this.callbacks.onNextLevel();
      });
    }
    this.overlay.querySelector('#replay-btn')!.addEventListener('click', () => {
      this.hideOverlay();
      this.callbacks.onRestart();
    });
    this.overlay.querySelector('#menu-btn2')!.addEventListener('click', () => {
      this.callbacks.onMenu();
    });
  }

  showFinalWin(totalLevels: number): void {
    this.overlay.classList.remove('hidden');
    this.overlay.innerHTML = `
      <div class="menu-container final-win">
        <h1 class="final-title">全關卡完成</h1>
        <p class="final-subtitle">你穿越了全部 ${totalLevels} 座迷霧迷宮。</p>
        <div class="final-emoji">★★★</div>
        <div class="menu-buttons">
          <button class="menu-btn primary" id="play-again-btn">從第一關重玩</button>
          <button class="menu-btn" id="menu-btn3">回主選單</button>
        </div>
      </div>
    `;

    this.overlay.querySelector('#play-again-btn')!.addEventListener('click', () => {
      this.hideOverlay();
      this.callbacks.onStart();
    });
    this.overlay.querySelector('#menu-btn3')!.addEventListener('click', () => {
      this.callbacks.onMenu();
    });
  }

  private showLevelSelect(): void {
    this.overlay.innerHTML = `
      <div class="menu-container level-select-container">
        <h2>選擇關卡</h2>
        <div class="level-grid">
          ${LEVELS.map((level) => {
            const record = this.getLevelProgress(level.level);
            const locked = !record?.unlocked;
            return `
              <button class="level-btn ${locked ? 'locked' : ''} ${record?.completed ? 'completed' : ''}"
                      data-level="${level.level}"
                      id="level-btn-${level.level}"
                      ${locked ? 'disabled' : ''}>
                <span class="level-num">${level.level}</span>
                <span class="level-size">${level.rows}×${level.cols}</span>
                <span class="level-chapter">${level.chapterName}</span>
                <span class="level-stars">${locked ? '鎖定' : this.renderStars(record?.stars ?? 0)}</span>
              </button>
            `;
          }).join('')}
        </div>
        <button class="menu-btn back-btn" id="back-to-menu">返回</button>
      </div>
    `;

    this.overlay.querySelectorAll<HTMLButtonElement>('.level-btn:not(.locked)').forEach((btn) => {
      btn.addEventListener('click', () => {
        const level = parseInt(btn.dataset.level!, 10);
        this.hideOverlay();
        this.callbacks.onSelectLevel(level);
      });
    });

    this.overlay.querySelector('#back-to-menu')!.addEventListener('click', () => {
      this.showMenu();
    });
  }

  private showSettings(): void {
    this.overlay.innerHTML = `
      <div class="menu-container settings-container">
        <h2>設定</h2>
        <div class="settings-group">
          <label class="setting-label">選單主題</label>
          <div class="theme-grid">
            ${THEME_NAMES.map((name) => {
              const theme = THEMES[name];
              return `
                <button class="theme-btn ${this.settings.theme === name ? 'active' : ''}"
                        data-theme="${name}" id="theme-${name}"
                        style="background:${theme.colors.background};color:${theme.colors.text};border-color:${theme.colors.accent}">
                  <span>${theme.emoji}</span>
                  <span class="theme-name">${theme.displayName}</span>
                </button>`;
            }).join('')}
          </div>
        </div>
        <div class="settings-group">
          <label class="setting-label">移動模式</label>
          <div class="toggle-group">
            <button class="toggle-btn ${this.settings.movementMode === 'grid' ? 'active' : ''}"
                    data-mode="grid" id="mode-grid">格子移動</button>
            <button class="toggle-btn ${this.settings.movementMode === 'free' ? 'active' : ''}"
                    data-mode="free" id="mode-free">自由移動</button>
          </div>
        </div>
        <div class="settings-group">
          <label class="setting-label" id="volume-label">音量 ${Math.round(this.settings.volume * 100)}%</label>
          <input type="range" min="0" max="100" value="${this.settings.volume * 100}"
                 class="volume-slider" id="volume-slider">
        </div>
        <div class="settings-group">
          <label class="setting-label checkbox-label">
            <input type="checkbox" ${this.settings.sfxOn ? 'checked' : ''} id="sfx-toggle">
            音效
          </label>
        </div>
        <button class="menu-btn back-btn" id="back-from-settings">返回</button>
      </div>
    `;

    this.overlay.querySelectorAll('.theme-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = (btn as HTMLElement).dataset.theme as ThemeName;
        this.settings.theme = theme;
        this.overlay.querySelectorAll('.theme-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.callbacks.onSettingsChange({ ...this.settings });
      });
    });

    this.overlay.querySelectorAll('.toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = (btn as HTMLElement).dataset.mode as 'grid' | 'free';
        this.settings.movementMode = mode;
        this.overlay.querySelectorAll('.toggle-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.callbacks.onSettingsChange({ ...this.settings });
      });
    });

    this.overlay.querySelector('#volume-slider')!.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      this.settings.volume = val / 100;
      const label = this.overlay.querySelector('#volume-label') as HTMLElement;
      label.textContent = `音量 ${val}%`;
      this.callbacks.onSettingsChange({ ...this.settings });
    });

    this.overlay.querySelector('#sfx-toggle')!.addEventListener('change', (e) => {
      this.settings.sfxOn = (e.target as HTMLInputElement).checked;
      this.callbacks.onSettingsChange({ ...this.settings });
    });

    this.overlay.querySelector('#back-from-settings')!.addEventListener('click', () => {
      this.showMenu();
    });
  }

  hideOverlay(): void {
    this.overlay.classList.add('hidden');
  }

  showHUD(): void {
    this.hudBar.classList.remove('hidden');
  }

  hideHUD(): void {
    this.hudBar.classList.add('hidden');
  }

  updateSettings(settings: GameSettings): void {
    this.settings = { ...settings };
  }

  destroy(): void {
    this.hudBar.remove();
    this.overlay.remove();
    this.minimapBtn.remove();
  }

  private getLevelProgress(level: number): LevelProgress | undefined {
    return this.progress?.levels[level];
  }

  private getCompletedCount(): number {
    if (!this.progress) return 0;
    return LEVELS.filter((level) => this.progress?.levels[level.level]?.completed).length;
  }

  private renderStars(stars: number): string {
    return '★'.repeat(stars) + '☆'.repeat(3 - stars);
  }

  private formatRecordTime(record: LevelProgress | undefined): string {
    return record?.bestTime === null || record?.bestTime === undefined ? '-' : this.formatTime(record.bestTime);
  }

  private formatRecordSteps(record: LevelProgress | undefined): string {
    return record?.bestSteps === null || record?.bestSteps === undefined ? '-' : `${record.bestSteps}`;
  }

  private formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}
