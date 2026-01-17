export function newGame(config) {
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
