import { Board } from "./types";

export function neighbors(width: number, height: number, x: number, y: number): number[] {
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      out.push(ny * width + nx);
    }
  }
  return out;
}

export function computeClues(board: Board): void {
  const { width, height, cells } = board;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const cell = cells[i];
      if (cell.mine) {
        cell.clue = 0;
        continue;
      }
      let count = 0;
      const ns = neighbors(width, height, x, y);
      for (const ni of ns) {
        if (cells[ni].mine) count++;
      }
      cell.clue = count;
    }
  }
}
