import { renderBoard } from "./renderer_dom.js";
import { updateHud, setStatus } from "./hud.js";

export function renderAll(model, ctx) {
  renderBoard(model, ctx.buttons);
  updateHud(model, ctx.hud);
}

export function setStatusLine(ctx, text) {
  setStatus(ctx.hud, text);
}
