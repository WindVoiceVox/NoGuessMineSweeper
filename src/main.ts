import { newGame, DifficultyConfig, GameModel } from "./game/game_state";
import { openCell } from "./game/floodfill";
import { applyOpenResult } from "./game/game_logic";
import { Pos } from "./game/types";
import { createBoardButtons, renderBoard } from "./ui/renderer_dom";
import { bindBoardInput } from "./ui/input";
import { updateHud, setStatus, HudElements } from "./ui/hud";
import { GenerateRequest, WorkerResponse } from "./worker/protocol";
import { PooledAudioPlayer } from "./audio/audio_player";
import { SFX } from "./assets/manifest";

const difficulties: DifficultyConfig[] = [
  { key: "easy", width: 9, height: 9, mineCount: 10, safeRadius: 1, maxAttempts: 200 },
  { key: "medium", width: 16, height: 16, mineCount: 40, safeRadius: 1, maxAttempts: 300 },
  { key: "hard", width: 30, height: 16, mineCount: 99, safeRadius: 1, maxAttempts: 400 },
];

const hud: HudElements = {
  mineCounter: document.querySelector("#mineCounter") as HTMLElement,
  timer: document.querySelector("#timer") as HTMLElement,
  statusLine: document.querySelector("#statusLine") as HTMLElement,
};
const difficultySelect = document.querySelector("#difficulty") as HTMLSelectElement;
const newGameBtn = document.querySelector("#newGame") as HTMLButtonElement;
const boardRoot = document.querySelector("#boardRoot") as HTMLElement;

let currentDifficulty = difficulties[0];
let model: GameModel = newGame(currentDifficulty);
let buttons = createBoardButtons(boardRoot, model.width, model.height);
const audioPlayer = new PooledAudioPlayer({
  OPEN_1: SFX.open1,
  OPEN_0: SFX.open0,
  FLAG_ON: SFX.flagOn,
  FLAG_OFF: SFX.flagOff,
  BOOM: SFX.boom,
  CLEAR: SFX.clear,
  UI_CLICK: SFX.uiClick,
});

const worker = new Worker(new URL("./worker/worker.ts", import.meta.url), { type: "module" });

function render(): void {
  renderBoard(model, buttons);
  updateHud(model, hud);
}

function setStatusLine(text: string): void {
  setStatus(hud, text);
}

function resetGame(config: DifficultyConfig): void {
  currentDifficulty = config;
  model = newGame(config);
  buttons = createBoardButtons(boardRoot, model.width, model.height);
  setStatusLine("Ready");
  render();
}

function requestGeneration(pos: Pos): void {
  model.phase = "GENERATING";
  model.startPos = pos;
  setStatusLine("Generating...");
  const req: GenerateRequest = {
    type: "GENERATE",
    width: model.width,
    height: model.height,
    mineCount: model.mineCount,
    startX: pos.x,
    startY: pos.y,
    safeRadius: currentDifficulty.safeRadius,
    maxAttempts: currentDifficulty.maxAttempts,
    seed: model.seed,
  };
  worker.postMessage(req);
  render();
}

function onOpen(idx: number): void {
  if (model.phase === "GAMEOVER" || model.phase === "CLEAR") return;
  const pos = { x: idx % model.width, y: Math.floor(idx / model.width) };
  if (model.phase === "READY") {
    requestGeneration(pos);
    return;
  }
  if (model.phase !== "PLAYING" || !model.board) return;
  const result = openCell(model.board, idx);
  applyOpenResult(model, model.board, result);
  if (result.hitMine) {
    audioPlayer.play("BOOM");
  } else if (result.openedIndices.length > 0) {
    const clicked = model.board.cells[idx];
    const hasZero = clicked.clue === 0 && result.openedIndices.length > 1;
    audioPlayer.play(hasZero ? "OPEN_0" : "OPEN_1");
  }
  if (model.phase === "GAMEOVER") {
    setStatusLine("Game Over");
  } else if (model.phase === "CLEAR") {
    setStatusLine("Clear!");
    audioPlayer.play("CLEAR");
  }
  render();
}

function onFlag(idx: number): void {
  if (model.phase !== "PLAYING" || !model.board) return;
  const cell = model.board.cells[idx];
  if (cell.opened) return;
  cell.flagged = !cell.flagged;
  model.flaggedCount += cell.flagged ? 1 : -1;
  audioPlayer.play(cell.flagged ? "FLAG_ON" : "FLAG_OFF");
  render();
}

bindBoardInput(boardRoot, { onOpen, onFlag });

worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
  const msg = ev.data;
  if (msg.type === "GENERATE_OK") {
    model.board = msg.board;
    model.phase = "PLAYING";
    model.startTimeMs = performance.now();
    model.elapsedMs = 0;
    model.generationAttempts = msg.attempts;
    setStatusLine(`Generated in ${msg.attempts} attempts`);
    if (model.startPos) {
      const startIdx = model.startPos.y * model.width + model.startPos.x;
      const result = openCell(model.board, startIdx);
      applyOpenResult(model, model.board, result);
    }
    render();
    return;
  }
  if (msg.type === "GENERATE_FAIL") {
    model.generationAttempts += msg.attempts;
    setStatusLine(`Generating... retry ${model.generationAttempts}`);
    if (model.startPos) {
      requestGeneration(model.startPos);
    } else {
      model.phase = "READY";
    }
  }
};

difficultySelect.addEventListener("change", () => {
  const next = difficulties.find((d) => d.key === difficultySelect.value);
  if (next) {
    resetGame(next);
    audioPlayer.play("UI_CLICK");
  }
});

newGameBtn.addEventListener("click", () => {
  resetGame(currentDifficulty);
  audioPlayer.play("UI_CLICK");
});

setInterval(() => {
  if (model.phase === "PLAYING" && model.startTimeMs !== null) {
    model.elapsedMs = performance.now() - model.startTimeMs;
    updateHud(model, hud);
  }
}, 200);

resetGame(currentDifficulty);
void audioPlayer.preload();
