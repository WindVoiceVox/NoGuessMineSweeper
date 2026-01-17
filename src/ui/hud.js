export function updateHud(model, hud) {
  const minesLeft = Math.max(0, model.mineCount - model.flaggedCount);
  hud.mineCounter.textContent = `💣 ${minesLeft.toString().padStart(3, "0")}`;
  const seconds = Math.floor(model.elapsedMs / 1000);
  hud.timer.textContent = `⏱ ${seconds.toString().padStart(3, "0")}`;
}

export function setStatus(hud, text) {
  hud.statusLine.textContent = text;
}
