// ==========================================
// 手機觸控輸入（虛擬方向鍵 D-pad）
// ==========================================

import type { Direction } from '../types';

export class TouchInput {
  private container: HTMLElement | null = null;
  private _direction: Direction = null;
  private dpad: HTMLElement | null = null;
  private activeButton: HTMLElement | null = null;

  init(container: HTMLElement): void {
    this.container = container;
    this.createDpad();
  }

  destroy(): void {
    if (this.dpad && this.container) {
      this.container.removeChild(this.dpad);
    }
    this.dpad = null;
  }

  getDirection(): Direction {
    return this._direction;
  }

  show(): void {
    if (this.dpad) this.dpad.style.display = 'flex';
  }

  hide(): void {
    if (this.dpad) this.dpad.style.display = 'none';
  }

  private createDpad(): void {
    const dpad = document.createElement('div');
    dpad.id = 'dpad';
    dpad.className = 'dpad-container';
    dpad.innerHTML = `
      <button class="dpad-btn dpad-up" data-dir="up" id="dpad-up" aria-label="上">▲</button>
      <div class="dpad-middle">
        <button class="dpad-btn dpad-left" data-dir="left" id="dpad-left" aria-label="左">◄</button>
        <div class="dpad-center"></div>
        <button class="dpad-btn dpad-right" data-dir="right" id="dpad-right" aria-label="右">►</button>
      </div>
      <button class="dpad-btn dpad-down" data-dir="down" id="dpad-down" aria-label="下">▼</button>
    `;

    // 觸控事件
    const buttons = dpad.querySelectorAll('.dpad-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const dir = (btn as HTMLElement).dataset.dir as Direction;
        this._direction = dir;
        this.activeButton = btn as HTMLElement;
        btn.classList.add('active');
        // 震動回饋
        if (navigator.vibrate) navigator.vibrate(10);
      });

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this._direction = null;
        btn.classList.remove('active');
        this.activeButton = null;
      });

      btn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        this._direction = null;
        btn.classList.remove('active');
        this.activeButton = null;
      });

      // 滑動到其他按鈕
      btn.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = (e as TouchEvent).touches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (el && el !== this.activeButton && el.classList.contains('dpad-btn')) {
          if (this.activeButton) this.activeButton.classList.remove('active');
          const dir = (el as HTMLElement).dataset.dir as Direction;
          this._direction = dir;
          this.activeButton = el as HTMLElement;
          el.classList.add('active');
        }
      });
    });

    this.container?.appendChild(dpad);
    this.dpad = dpad;
  }

  /** 檢測是否為觸控裝置 */
  static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
}
