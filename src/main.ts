// ==========================================
// 入口：初始化遊戲
// ==========================================

import { GameEngine } from './game/engine';
import '../styles/main.css';

// 取得 DOM 元素
const container = document.getElementById('game-container')!;
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

// 建立遊戲引擎
const engine = new GameEngine(canvas, container);

// 啟動遊戲
engine.start();
