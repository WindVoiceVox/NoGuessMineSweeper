import { GameModel } from "../game/game_state";

export type HudElements = {
  mineCounter: HTMLElement;
  timer: HTMLElement;
  statusLine: HTMLElement;
};

export function updateHud(model: GameModel, hud: HudElements): void {
  const minesLeft = Math.max(0, model.mineCount - model.flaggedCount);
  hud.mineCounter.textContent = `💣 ${minesLeft.toString().padStart(3, "0")}`;
  const seconds = Math.floor(model.elapsedMs / 1000);
  hud.timer.textContent = `⏱ ${seconds.toString().padStart(3, "0")}`;
}

export function setStatus(hud: HudElements, text: string): void {
  hud.statusLine.textContent = text;
}
