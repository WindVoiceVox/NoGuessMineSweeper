import { GameModel } from "../game/game_state";
import { renderBoard } from "./renderer_dom";
import { updateHud, setStatus, HudElements } from "./hud";

export type UiContext = {
  hud: HudElements;
  buttons: HTMLButtonElement[];
};

export function renderAll(model: GameModel, ctx: UiContext): void {
  renderBoard(model, ctx.buttons);
  updateHud(model, ctx.hud);
}

export function setStatusLine(ctx: UiContext, text: string): void {
  setStatus(ctx.hud, text);
}
