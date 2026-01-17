export function bindBoardInput(root, handlers) {
  root.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const idxStr = target.dataset.idx;
    if (!idxStr) return;
    handlers.onOpen(Number(idxStr));
  });

  root.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    const target = ev.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const idxStr = target.dataset.idx;
    if (!idxStr) return;
    handlers.onFlag(Number(idxStr));
  });
}
