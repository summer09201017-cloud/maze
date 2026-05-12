import type { LevelConfig, ThemeName } from '../types';

type Chapter = {
  chapterName: string;
  theme: ThemeName;
};

const CHAPTERS: Chapter[] = [
  { chapterName: '森林晨霧', theme: 'forest' },
  { chapterName: '地牢暗徑', theme: 'dungeon' },
  { chapterName: '星際迷航', theme: 'space' },
  { chapterName: '終端迷城', theme: 'retro' },
];

const BASE_LEVELS: Omit<LevelConfig, 'chapterName' | 'theme'>[] = [
  {
    level: 1,
    rows: 5, cols: 5,
    fogRadius: 2.8, timeLimit: 0,
    star3Time: 20, star2Time: 45,
    star3Steps: 14, star2Steps: 24,
    minimapUnlockTime: 25,
    hintCount: 3,
  },
  {
    level: 2,
    rows: 7, cols: 7,
    fogRadius: 3.0, timeLimit: 0,
    star3Time: 30, star2Time: 60,
    star3Steps: 30, star2Steps: 50,
    minimapUnlockTime: 30,
    hintCount: 3,
  },
  {
    level: 3,
    rows: 9, cols: 9,
    fogRadius: 3.2, timeLimit: 75,
    star3Time: 45, star2Time: 70,
    star3Steps: 50, star2Steps: 80,
    minimapUnlockTime: 35,
    hintCount: 3,
  },
  {
    level: 4,
    rows: 11, cols: 11,
    fogRadius: 3.2, timeLimit: 0,
    star3Time: 60, star2Time: 95,
    star3Steps: 70, star2Steps: 110,
    minimapUnlockTime: 40,
    hintCount: 3,
  },
  {
    level: 5,
    rows: 13, cols: 13,
    fogRadius: 3.0, timeLimit: 120,
    star3Time: 75, star2Time: 110,
    star3Steps: 95, star2Steps: 145,
    minimapUnlockTime: 45,
    hintCount: 3,
  },
  {
    level: 6,
    rows: 15, cols: 15,
    fogRadius: 2.9, timeLimit: 0,
    star3Time: 90, star2Time: 140,
    star3Steps: 125, star2Steps: 190,
    minimapUnlockTime: 50,
    hintCount: 2,
  },
  {
    level: 7,
    rows: 17, cols: 17,
    fogRadius: 2.8, timeLimit: 150,
    star3Time: 105, star2Time: 160,
    star3Steps: 160, star2Steps: 235,
    minimapUnlockTime: 55,
    hintCount: 2,
  },
  {
    level: 8,
    rows: 19, cols: 19,
    fogRadius: 2.7, timeLimit: 0,
    star3Time: 125, star2Time: 185,
    star3Steps: 200, star2Steps: 300,
    minimapUnlockTime: 60,
    hintCount: 2,
  },
  {
    level: 9,
    rows: 21, cols: 21,
    fogRadius: 2.6, timeLimit: 180,
    star3Time: 150, star2Time: 220,
    star3Steps: 245, star2Steps: 360,
    minimapUnlockTime: 65,
    hintCount: 2,
  },
  {
    level: 10,
    rows: 23, cols: 23,
    fogRadius: 2.6, timeLimit: 210,
    star3Time: 175, star2Time: 250,
    star3Steps: 295, star2Steps: 430,
    minimapUnlockTime: 70,
    hintCount: 2,
  },
  {
    level: 11,
    rows: 25, cols: 25,
    fogRadius: 2.5, timeLimit: 0,
    star3Time: 205, star2Time: 300,
    star3Steps: 350, star2Steps: 520,
    minimapUnlockTime: 75,
    hintCount: 2,
  },
  {
    level: 12,
    rows: 27, cols: 27,
    fogRadius: 2.5, timeLimit: 240,
    star3Time: 235, star2Time: 330,
    star3Steps: 410, star2Steps: 600,
    minimapUnlockTime: 80,
    hintCount: 2,
  },
  {
    level: 13,
    rows: 29, cols: 29,
    fogRadius: 2.4, timeLimit: 270,
    star3Time: 270, star2Time: 380,
    star3Steps: 475, star2Steps: 700,
    minimapUnlockTime: 85,
    hintCount: 2,
  },
  {
    level: 14,
    rows: 31, cols: 31,
    fogRadius: 2.4, timeLimit: 0,
    star3Time: 310, star2Time: 430,
    star3Steps: 545, star2Steps: 800,
    minimapUnlockTime: 90,
    hintCount: 2,
  },
  {
    level: 15,
    rows: 33, cols: 33,
    fogRadius: 2.3, timeLimit: 320,
    star3Time: 350, star2Time: 480,
    star3Steps: 620, star2Steps: 900,
    minimapUnlockTime: 95,
    hintCount: 2,
  },
  {
    level: 16,
    rows: 35, cols: 35,
    fogRadius: 2.3, timeLimit: 0,
    star3Time: 395, star2Time: 540,
    star3Steps: 700, star2Steps: 1020,
    minimapUnlockTime: 100,
    hintCount: 1,
  },
  {
    level: 17,
    rows: 35, cols: 35,
    fogRadius: 2.2, timeLimit: 360,
    star3Time: 430, star2Time: 580,
    star3Steps: 760, star2Steps: 1100,
    minimapUnlockTime: 105,
    hintCount: 1,
  },
  {
    level: 18,
    rows: 37, cols: 37,
    fogRadius: 2.2, timeLimit: 0,
    star3Time: 475, star2Time: 630,
    star3Steps: 830, star2Steps: 1200,
    minimapUnlockTime: 110,
    hintCount: 1,
  },
  {
    level: 19,
    rows: 37, cols: 37,
    fogRadius: 2.1, timeLimit: 420,
    star3Time: 520, star2Time: 700,
    star3Steps: 910, star2Steps: 1320,
    minimapUnlockTime: 115,
    hintCount: 1,
  },
  {
    level: 20,
    rows: 39, cols: 39,
    fogRadius: 2.1, timeLimit: 480,
    star3Time: 570, star2Time: 760,
    star3Steps: 1000, star2Steps: 1450,
    minimapUnlockTime: 120,
    hintCount: 1,
  },
];

export const LEVELS: LevelConfig[] = BASE_LEVELS.map((level) => ({
  ...level,
  ...CHAPTERS[Math.floor((level.level - 1) / 5)],
}));

export function calculateStars(level: LevelConfig, timeTaken: number, steps: number): number {
  if (timeTaken <= level.star3Time && steps <= level.star3Steps) return 3;
  if (timeTaken <= level.star2Time && steps <= level.star2Steps) return 2;
  return 1;
}
