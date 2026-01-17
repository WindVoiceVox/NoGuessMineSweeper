import { neighbors } from "../game/board";
import { SolverState } from "./solver";

export type RuleResult = {
  changed: boolean;
  contradiction: boolean;
};

export function applySimpleRules(state: SolverState): RuleResult {
  const { width, height, s } = state;
  let changed = false;
  for (let i = 0; i < s.length; i++) {
    const cell = s[i];
    if (!cell.opened) continue;
    const x = i % width;
    const y = Math.floor(i / width);
    const ns = neighbors(width, height, x, y);
    let unknown: number[] = [];
    let mineMarked = 0;
    for (const ni of ns) {
      const ncell = s[ni];
      if (!ncell.opened && ncell.mark === "UNKNOWN") {
        unknown.push(ni);
      } else if (ncell.mark === "MINE") {
        mineMarked++;
      }
    }
    const remaining = cell.clue - mineMarked;
    if (remaining < 0) return { changed, contradiction: true };
    if (remaining > unknown.length) return { changed, contradiction: true };
    if (remaining === 0 && unknown.length > 0) {
      for (const ni of unknown) {
        if (state.s[ni].mark !== "SAFE") {
          state.s[ni].mark = "SAFE";
          state.openSafeCell(ni);
          changed = true;
        }
      }
    } else if (remaining === unknown.length && unknown.length > 0) {
      for (const ni of unknown) {
        if (state.s[ni].mark !== "MINE") {
          state.s[ni].mark = "MINE";
          changed = true;
        }
      }
    }
  }
  return { changed, contradiction: false };
}
