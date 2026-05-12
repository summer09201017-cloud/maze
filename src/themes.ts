// ==========================================
// 6 種視覺主題定義
// ==========================================

import type { Theme, ThemeName } from './types';

/** 暗色霓虹 Cyberpunk */
const cyberpunk: Theme = {
  name: 'cyberpunk',
  displayName: '暗色霓虹',
  emoji: '🔮',
  colors: {
    background: '#0a0a1a',
    wall: '#1a1a4e',
    wallGlow: '#6a5aff',
    path: '#0d0d2b',
    pathExplored: '#12123a',
    player: '#00ffaa',
    playerGlow: '#00ffaa55',
    trail: '#00ffaa22',
    exit: '#ff6b6b',
    exitPulse: '#ff6b6b88',
    fog: '#0a0a1a',
    text: '#e0e0ff',
    accent: '#7c5cff',
    hud: '#0a0a1acc',
    hudText: '#e0e0ff',
  },
  wallWidth: 3,
  playerRadius: 0.35,
  glowIntensity: 15,
  particles: {
    color: '#00ffaa',
    glowColor: '#7c5cff',
    count: 30,
    speed: 0.5,
    size: 2,
  },
  fontFamily: '"Orbitron", sans-serif',
};

/** 魔法森林 Enchanted */
const forest: Theme = {
  name: 'forest',
  displayName: '魔法森林',
  emoji: '🌿',
  colors: {
    background: '#0a1f0a',
    wall: '#1a3a1a',
    wallGlow: '#2d6b2d',
    path: '#0d1a0d',
    pathExplored: '#122212',
    player: '#ffd700',
    playerGlow: '#ffd70055',
    trail: '#ffd70022',
    exit: '#ff69b4',
    exitPulse: '#ff69b488',
    fog: '#0a1f0a',
    text: '#c8e6c8',
    accent: '#4caf50',
    hud: '#0a1f0acc',
    hudText: '#c8e6c8',
  },
  wallWidth: 4,
  playerRadius: 0.3,
  glowIntensity: 10,
  particles: {
    color: '#7fff00',
    glowColor: '#ffd700',
    count: 40,
    speed: 0.3,
    size: 3,
  },
  fontFamily: '"Georgia", serif',
};

/** 地牢探險 Dungeon */
const dungeon: Theme = {
  name: 'dungeon',
  displayName: '地牢探險',
  emoji: '🏰',
  colors: {
    background: '#1a1210',
    wall: '#4a3a2a',
    wallGlow: '#8b6914',
    path: '#1a1410',
    pathExplored: '#221a14',
    player: '#ff8c00',
    playerGlow: '#ff8c0055',
    trail: '#ff8c0022',
    exit: '#ff4444',
    exitPulse: '#ff444488',
    fog: '#1a1210',
    text: '#d4c4a8',
    accent: '#cd853f',
    hud: '#1a1210cc',
    hudText: '#d4c4a8',
  },
  wallWidth: 5,
  playerRadius: 0.3,
  glowIntensity: 8,
  particles: {
    color: '#ff6600',
    glowColor: '#ff4400',
    count: 20,
    speed: 0.8,
    size: 2,
  },
  fontFamily: '"Cinzel", serif',
};

/** 極簡現代 Minimal */
const minimal: Theme = {
  name: 'minimal',
  displayName: '極簡現代',
  emoji: '✨',
  colors: {
    background: '#fafafa',
    wall: '#222222',
    wallGlow: '#22222200',
    path: '#ffffff',
    pathExplored: '#f0f0f0',
    player: '#1a1a1a',
    playerGlow: '#1a1a1a22',
    trail: '#1a1a1a15',
    exit: '#e74c3c',
    exitPulse: '#e74c3c44',
    fog: '#fafafa',
    text: '#1a1a1a',
    accent: '#3498db',
    hud: '#ffffffcc',
    hudText: '#1a1a1a',
  },
  wallWidth: 2,
  playerRadius: 0.3,
  glowIntensity: 0,
  particles: {
    color: '#3498db',
    glowColor: '#2980b9',
    count: 15,
    speed: 0.3,
    size: 2,
  },
  fontFamily: '"Inter", sans-serif',
};

/** 像素復古 Retro */
const retro: Theme = {
  name: 'retro',
  displayName: '像素復古',
  emoji: '👾',
  colors: {
    background: '#2b2b2b',
    wall: '#5a5a5a',
    wallGlow: '#5a5a5a00',
    path: '#1a1a1a',
    pathExplored: '#252525',
    player: '#33ff33',
    playerGlow: '#33ff3344',
    trail: '#33ff3318',
    exit: '#ff3333',
    exitPulse: '#ff333366',
    fog: '#2b2b2b',
    text: '#33ff33',
    accent: '#ffff33',
    hud: '#000000cc',
    hudText: '#33ff33',
  },
  wallWidth: 4,
  playerRadius: 0.4,
  glowIntensity: 3,
  particles: {
    color: '#33ff33',
    glowColor: '#ffff33',
    count: 10,
    speed: 1.0,
    size: 3,
  },
  fontFamily: '"Press Start 2P", monospace',
};

/** 太空站 Space */
const space: Theme = {
  name: 'space',
  displayName: '太空站',
  emoji: '🚀',
  colors: {
    background: '#050510',
    wall: '#1a2a4a',
    wallGlow: '#4488cc',
    path: '#080818',
    pathExplored: '#0c0c28',
    player: '#00aaff',
    playerGlow: '#00aaff55',
    trail: '#00aaff18',
    exit: '#ff6600',
    exitPulse: '#ff660088',
    fog: '#050510',
    text: '#aaccee',
    accent: '#4488cc',
    hud: '#050510cc',
    hudText: '#aaccee',
  },
  wallWidth: 2,
  playerRadius: 0.35,
  glowIntensity: 12,
  particles: {
    color: '#ffffff',
    glowColor: '#4488cc',
    count: 50,
    speed: 0.2,
    size: 1.5,
  },
  fontFamily: '"Orbitron", sans-serif',
};

/** 所有主題映射 */
export const THEMES: Record<ThemeName, Theme> = {
  cyberpunk,
  forest,
  dungeon,
  minimal,
  retro,
  space,
};

/** 主題名稱列表 */
export const THEME_NAMES: ThemeName[] = ['cyberpunk', 'forest', 'dungeon', 'minimal', 'retro', 'space'];

/** 取得主題 */
export function getTheme(name: ThemeName): Theme {
  return THEMES[name];
}
