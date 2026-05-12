// ==========================================
// Web Audio API 合成音效
// ==========================================

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _volume = 0.5;
  private _sfxOn = true;
  private initialized = false;

  init(): void {
    // AudioContext 需要用戶互動後才能建立
    if (this.initialized) return;
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._volume;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch {
      console.warn('Web Audio API 不可用');
    }
  }

  /** 確保 AudioContext 在用戶互動後啟動 */
  resume(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  set volume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.value = this._volume;
    }
  }

  get volume(): number { return this._volume; }

  set sfxOn(on: boolean) { this._sfxOn = on; }
  get sfxOn(): boolean { return this._sfxOn; }

  /** 移動音效 */
  playMove(): void {
    if (!this._sfxOn) return;
    this.playTone(440, 0.05, 'sine', 0.2);
  }

  /** 碰牆音效 */
  playWallHit(): void {
    if (!this._sfxOn) return;
    this.playTone(100, 0.1, 'square', 0.15);
  }

  /** 過關音效（上行琶音） */
  playWin(): void {
    if (!this._sfxOn) return;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.3), i * 120);
    });
  }

  /** 星星獲得音效 */
  playStar(): void {
    if (!this._sfxOn) return;
    this.playTone(880, 0.15, 'sine', 0.25);
  }

  /** 倒數警告音效 */
  playWarning(): void {
    if (!this._sfxOn) return;
    this.playTone(800, 0.08, 'square', 0.3);
  }

  /** 按鈕點擊音效 */
  playClick(): void {
    if (!this._sfxOn) return;
    this.playTone(600, 0.03, 'sine', 0.15);
  }

  /** 迷你地圖解鎖音效 */
  playUnlock(): void {
    if (!this._sfxOn) return;
    const notes = [400, 500, 600, 800];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'triangle', 0.2), i * 100);
    });
  }

  /** 生成基本音效 */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ): void {
    if (!this.ctx || !this.masterGain) {
      this.init();
      if (!this.ctx || !this.masterGain) return;
    }

    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration + 0.05);
  }

  destroy(): void {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
