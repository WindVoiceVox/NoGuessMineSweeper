export type Cell = {
  mine: boolean;
  opened: boolean;
  flagged: boolean;
  clue: number;
};

export type Board = {
  width: number;
  height: number;
  mineCount: number;
  cells: Cell[];
};

export type Pos = { x: number; y: number };

export function idx(width: number, x: number, y: number): number {
  return y * width + x;
}
