import { Board, Pos } from "./types";

export type Phase = "READY" | "GENERATING" | "PLAYING" | "CLEAR" | "GAMEOVER";

export type GameModel = {
  phase: Phase;
  width: number;
  height: number;
  mineCount: number;
  board: Board | null;
  startPos: Pos | null;
  openedCount: number;
  flaggedCount: number;
  startTimeMs: number | null;
  elapsedMs: number;
  generationAttempts: number;
  seed?: string;
  hoveredIdx: number | null;
};

export type DifficultyConfig = {
  key: "easy" | "medium" | "hard";
  width: number;
  height: number;
  mineCount: number;
  safeRadius: number;
  maxAttempts: number;
};

export function newGame(config: DifficultyConfig): GameModel {
  return {
    phase: "READY",
    width: config.width,
    height: config.height,
    mineCount: config.mineCount,
    board: null,
    startPos: null,
    openedCount: 0,
    flaggedCount: 0,
    startTimeMs: null,
    elapsedMs: 0,
    generationAttempts: 0,
    hoveredIdx: null,
  };
}
