import { Board } from "./types";

export type OpenResult = {
  openedIndices: number[];
  hitMine: boolean;
};

export function openCell(board: Board, i: number): OpenResult {
  const cell = board.cells[i];
  if (cell.opened || cell.flagged) {
    return { openedIndices: [], hitMine: false };
  }
  cell.opened = true;
  if (cell.mine) {
    return { openedIndices: [i], hitMine: true };
  }
  const opened: number[] = [i];
  if (cell.clue > 0) {
    return { openedIndices: opened, hitMine: false };
  }
  const queue: number[] = [i];
  const { width, height, cells } = board;
  while (queue.length > 0) {
    const current = queue.shift() as number;
    const x = current % width;
    const y = Math.floor(current / width);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        const ncell = cells[ni];
        if (ncell.opened || ncell.flagged || ncell.mine) continue;
        ncell.opened = true;
        opened.push(ni);
        if (ncell.clue === 0) {
          queue.push(ni);
        }
      }
    }
  }
  return { openedIndices: opened, hitMine: false };
}
