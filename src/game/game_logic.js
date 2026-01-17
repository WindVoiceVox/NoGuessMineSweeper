export function applyOpenResult(model, board, result) {
  if (result.hitMine) {
    model.phase = "GAMEOVER";
    model.openedCount += result.openedIndices.length;
    return;
  }
  if (result.openedIndices.length === 0) return;
  model.openedCount += result.openedIndices.length;
  const safeTotal = model.width * model.height - model.mineCount;
  if (model.openedCount >= safeTotal) {
    model.phase = "CLEAR";
  }
}
