import { computeClues } from "../game/board.js";
import { XorShift32, seedFromString } from "../game/rng.js";
import { solveWithoutGuess } from "./solver.js";

export function computeSafeZone(width, height, start, safeRadius) {
  const safe = new Set();
  for (let dy = -safeRadius; dy <= safeRadius; dy++) {
    for (let dx = -safeRadius; dx <= safeRadius; dx++) {
      const nx = start.x + dx;
      const ny = start.y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      safe.add(ny * width + nx);
    }
  }
  return safe;
}

export function placeMines(board, mineCount, excluded, rng) {
  const total = board.width * board.height;
  let placed = 0;
  while (placed < mineCount) {
    const i = rng.nextInt(total);
    if (excluded.has(i)) continue;
    const cell = board.cells[i];
    if (cell.mine) continue;
    cell.mine = true;
    placed++;
  }
}

function createEmptyBoard(width, height, mineCount) {
  const cells = Array.from({ length: width * height }, () => ({
    mine: false,
    opened: false,
    flagged: false,
    clue: 0,
  }));
  return { width, height, mineCount, cells };
}

export function generateNoGuessBoard(params) {
  const seed = params.seed ?? `${Date.now()}`;
  const rng = new XorShift32(seedFromString(seed));
  const start = { x: params.startX, y: params.startY };
  const safeZone = computeSafeZone(params.width, params.height, start, params.safeRadius);
  for (let attempt = 1; attempt <= params.maxAttempts; attempt++) {
    const board = createEmptyBoard(params.width, params.height, params.mineCount);
    placeMines(board, params.mineCount, safeZone, rng);
    computeClues(board);
    const result = solveWithoutGuess(board, start);
    if (result === "SOLVED") {
      return { type: "GENERATE_OK", board, attempts: attempt, seed };
    }
  }
  return { type: "GENERATE_FAIL", attempts: params.maxAttempts, reason: "no solution" };
}
