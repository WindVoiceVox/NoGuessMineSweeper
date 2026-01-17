import { neighbors } from "../game/board.js";

export function buildFrontier(state) {
  const { width, height, s } = state;
  const frontierSet = new Set();
  const constraints = [];

  for (let i = 0; i < s.length; i++) {
    const cell = s[i];
    if (!cell.opened || cell.clue === 0) continue;
    const x = i % width;
    const y = Math.floor(i / width);
    const ns = neighbors(width, height, x, y);
    const vars = [];
    let markedMines = 0;
    for (const ni of ns) {
      const ncell = s[ni];
      if (!ncell.opened && ncell.mark === "UNKNOWN") {
        vars.push(ni);
        frontierSet.add(ni);
      } else if (ncell.mark === "MINE") {
        markedMines++;
      }
    }
    if (vars.length > 0) {
      constraints.push({
        vars,
        sum: cell.clue - markedMines,
      });
    }
  }

  return { vars: Array.from(frontierSet), constraints };
}

export function splitFrontier(frontier) {
  if (frontier.vars.length === 0) return [];
  const indexMap = new Map();
  frontier.vars.forEach((v, idx) => indexMap.set(v, idx));
  const adjacency = Array.from({ length: frontier.vars.length }, () => []);

  for (const c of frontier.constraints) {
    const indices = c.vars.map((v) => indexMap.get(v));
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        const a = indices[i];
        const b = indices[j];
        adjacency[a].push(b);
        adjacency[b].push(a);
      }
    }
  }

  const visited = new Array(frontier.vars.length).fill(false);
  const components = [];

  for (let i = 0; i < frontier.vars.length; i++) {
    if (visited[i]) continue;
    const queue = [i];
    visited[i] = true;
    const compVars = [];
    while (queue.length) {
      const cur = queue.shift();
      compVars.push(frontier.vars[cur]);
      for (const next of adjacency[cur]) {
        if (!visited[next]) {
          visited[next] = true;
          queue.push(next);
        }
      }
    }
    const compSet = new Set(compVars);
    const compConstraints = frontier.constraints
      .filter((c) => c.vars.some((v) => compSet.has(v)))
      .map((c) => ({
        vars: c.vars.filter((v) => compSet.has(v)),
        sum: c.sum,
      }));
    components.push({ vars: compVars, constraints: compConstraints });
  }
  return components;
}

export function solveFrontier(frontier) {
  const n = frontier.vars.length;
  if (n === 0) {
    return { madeMove: false, safeForced: [], mineForced: [], contradiction: false };
  }
  const indexMap = new Map();
  frontier.vars.forEach((v, idx) => indexMap.set(v, idx));
  const mineCounts = new Array(n).fill(0);
  let solutions = 0;
  const max = 1 << n;

  for (let bits = 0; bits < max; bits++) {
    let ok = true;
    for (const c of frontier.constraints) {
      let count = 0;
      for (const v of c.vars) {
        const idx = indexMap.get(v);
        if (bits & (1 << idx)) count++;
      }
      if (count !== c.sum) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    solutions++;
    for (let i = 0; i < n; i++) {
      if (bits & (1 << i)) mineCounts[i]++;
    }
  }

  if (solutions === 0) {
    return { madeMove: false, safeForced: [], mineForced: [], contradiction: true };
  }
  const safeForced = [];
  const mineForced = [];
  for (let i = 0; i < n; i++) {
    if (mineCounts[i] === 0) safeForced.push(frontier.vars[i]);
    else if (mineCounts[i] === solutions) mineForced.push(frontier.vars[i]);
  }
  return {
    madeMove: safeForced.length > 0 || mineForced.length > 0,
    safeForced,
    mineForced,
    contradiction: false,
  };
}

export function applyFrontierConstraintSolve(state, limit) {
  const frontier = buildFrontier(state);
  const parts = splitFrontier(frontier);
  let changed = false;
  for (const part of parts) {
    if (part.vars.length === 0 || part.vars.length > limit) continue;
    const result = solveFrontier(part);
    if (result.contradiction) return { changed, contradiction: true };
    for (const safe of result.safeForced) {
      if (state.s[safe].mark !== "SAFE") {
        state.s[safe].mark = "SAFE";
        state.openSafeCell(safe);
        changed = true;
      }
    }
    for (const mine of result.mineForced) {
      if (state.s[mine].mark !== "MINE") {
        state.s[mine].mark = "MINE";
        changed = true;
      }
    }
  }
  return { changed, contradiction: false };
}
