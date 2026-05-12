// ==========================================
// 粒子特效系統
// ==========================================

import type { Particle } from '../types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles = 500;

  /** 更新所有粒子 */
  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /** 渲染所有粒子 */
  render(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, cellSize: number): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.size * 2;
      ctx.beginPath();
      ctx.arc(
        offsetX + p.x * cellSize,
        offsetY + p.y * cellSize,
        p.size,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();
  }

  /** 在玩家位置生成尾跡粒子 */
  emitTrail(x: number, y: number, color: string): void {
    if (this.particles.length >= this.maxParticles) return;
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 0.3,
        y: y + (Math.random() - 0.5) * 0.3,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        size: 1 + Math.random() * 2,
        color,
        alpha: 1,
      });
    }
  }

  /** 出口脈動粒子 */
  emitExitGlow(x: number, y: number, color: string): void {
    if (this.particles.length >= this.maxParticles) return;
    if (Math.random() > 0.3) return;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.5;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 0.4,
      y: y + (Math.random() - 0.5) * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 1,
      maxLife: 1.5,
      size: 2 + Math.random() * 3,
      color,
      alpha: 1,
    });
  }

  /** 過關煙火爆炸 */
  emitFireworks(x: number, y: number, colors: string[]): void {
    const count = 80;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 2 + Math.random() * 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1 + Math.random() * 2,
        maxLife: 3,
        size: 2 + Math.random() * 4,
        color,
        alpha: 1,
      });
    }
  }

  /** 環境粒子（螢火蟲、星星等） */
  emitAmbient(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    count: number
  ): void {
    if (this.particles.length >= this.maxParticles * 0.5) return;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + Math.random() * width,
        y: y + Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        life: 2 + Math.random() * 3,
        maxLife: 5,
        size: 1 + Math.random() * 2,
        color,
        alpha: 0.5,
      });
    }
  }

  /** 清空所有粒子 */
  clear(): void {
    this.particles = [];
  }

  get count(): number {
    return this.particles.length;
  }
}
