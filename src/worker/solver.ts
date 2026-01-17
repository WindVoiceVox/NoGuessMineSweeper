import { Board, Pos } from "../game/types";
import { applySimpleRules } from "./solver_rules";
import { applyFrontierConstraintSolve } from "./solver_frontier";
import { neighbors } from "../game/board";

export type SolverMark = "UNKNOWN" | "SAFE" | "MINE";

export type SolverCell = {
  opened: boolean;
  clue: number;
  mark: SolverMark;
};

export type SolverState = {
  width: number;
  height: number;
  mineCount: number;
  boardTruth: Board;
  s: SolverCell[];
  openedSafeCount: number;
  openSafeCell: (i: number) => void;
};

export type SolveResult = "SOLVED" | "STUCK" | "CONTRADICTION";

function createSolverState(board: Board): SolverState {
  const s: SolverCell[] = board.cells.map(() => ({
    opened: false,
    clue: 0,
    mark: "UNKNOWN",
  }));
  const state: SolverState = {
    width: board.width,
    height: board.height,
    mineCount: board.mineCount,
    boardTruth: board,
    s,
    openedSafeCount: 0,
    openSafeCell: () => {},
  };
  state.openSafeCell = (i: number) => openSafeCell(state, i);
  return state;
}

function openSafeCell(state: SolverState, i: number): void {
  const cell = state.s[i];
  if (cell.opened) return;
  const truth = state.boardTruth.cells[i];
  if (truth.mine) {
    throw new Error("contradiction");
  }
  cell.opened = true;
  cell.clue = truth.clue;
  state.openedSafeCount++;
  if (cell.clue !== 0) return;
  const queue: number[] = [i];
  while (queue.length > 0) {
    const cur = queue.shift() as number;
    const x = cur % state.width;
    const y = Math.floor(cur / state.width);
    const ns = neighbors(state.width, state.height, x, y);
    for (const ni of ns) {
      const ncell = state.s[ni];
      if (ncell.opened) continue;
      const truthCell = state.boardTruth.cells[ni];
      if (truthCell.mine) continue;
      ncell.opened = true;
      ncell.clue = truthCell.clue;
      state.openedSafeCount++;
      if (ncell.clue === 0) queue.push(ni);
    }
  }
}

export function solveWithoutGuess(board: Board, start: Pos): SolveResult {
  const state = createSolverState(board);
  try {
    openSafeCell(state, start.y * board.width + start.x);
  } catch {
    return "CONTRADICTION";
  }
  const safeTotal = board.width * board.height - board.mineCount;
  const frontierLimit = board.width * board.height >= 480 ? 18 : 20;

  while (true) {
    if (state.openedSafeCount >= safeTotal) return "SOLVED";
    const simple = applySimpleRules(state);
    if (simple.contradiction) return "CONTRADICTION";
    if (simple.changed) continue;
    const frontier = applyFrontierConstraintSolve(state, frontierLimit);
    if (frontier.contradiction) return "CONTRADICTION";
    if (!frontier.changed) return "STUCK";
  }
}
