// ==========================================
// PC 鍵盤輸入控制
// ==========================================

import type { Direction } from '../types';

export class KeyboardInput {
  private keys = new Set<string>();

  private _pause = false;
  private _pauseConsumed = false;

  init(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.code);

    if (e.code === 'Escape') {
      if (!this._pauseConsumed) {
        this._pause = true;
        this._pauseConsumed = true;
      }
    }

    // 防止方向鍵滾動頁面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
    if (e.code === 'Escape') {
      this._pauseConsumed = false;
    }
  };

  getDirection(): Direction {
    if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) return 'up';
    if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) return 'down';
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) return 'left';
    if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) return 'right';
    return null;
  }

  consumePause(): boolean {
    if (this._pause) {
      this._pause = false;
      return true;
    }
    return false;
  }
}
