export type InputHandlers = {
  onOpen: (idx: number) => void;
  onFlag: (idx: number) => void;
};

export function bindBoardInput(root: HTMLElement, handlers: InputHandlers): void {
  root.addEventListener("click", (ev) => {
    const target = ev.target as HTMLElement;
    if (!(target instanceof HTMLButtonElement)) return;
    const idxStr = target.dataset.idx;
    if (!idxStr) return;
    handlers.onOpen(Number(idxStr));
  });

  root.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    const target = ev.target as HTMLElement;
    if (!(target instanceof HTMLButtonElement)) return;
    const idxStr = target.dataset.idx;
    if (!idxStr) return;
    handlers.onFlag(Number(idxStr));
  });
}
