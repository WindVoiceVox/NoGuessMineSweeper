import { GameModel } from "../game/game_state";
import { Board } from "../game/types";

export function createBoardButtons(
  root: HTMLElement,
  width: number,
  height: number
): HTMLButtonElement[] {
  root.innerHTML = "";
  root.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;
  const buttons: HTMLButtonElement[] = [];
  for (let i = 0; i < width * height; i++) {
    const btn = document.createElement("button");
    btn.className = "cell closed";
    btn.dataset.idx = `${i}`;
    btn.type = "button";
    root.appendChild(btn);
    buttons.push(btn);
  }
  return buttons;
}

export function renderBoard(model: GameModel, buttons: HTMLButtonElement[]): void {
  const board = model.board;
  if (!board) {
    for (const btn of buttons) {
      btn.className = "cell closed";
      btn.textContent = "";
    }
    return;
  }
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    const cell = board.cells[i];
    const classes: string[] = ["cell"];
    let text = "";
    if (model.phase === "GAMEOVER") {
      if (cell.mine) {
        classes.push("opened", cell.opened ? "mine-red" : "mine");
        text = cell.opened ? "💥" : "💣";
      } else if (cell.flagged) {
        classes.push("wrong-flag");
        text = "❌";
      } else if (cell.opened) {
        classes.push("opened");
        if (cell.clue > 0) {
          classes.push(`n${cell.clue}`);
          text = `${cell.clue}`;
        }
      } else {
        classes.push("closed");
      }
    } else {
      if (cell.flagged) {
        classes.push("flagged");
        text = "🚩";
      } else if (cell.opened) {
        classes.push("opened");
        if (cell.clue > 0) {
          classes.push(`n${cell.clue}`);
          text = `${cell.clue}`;
        }
      } else {
        classes.push("closed");
      }
    }
    btn.className = classes.join(" ");
    btn.textContent = text;
  }
}

export function revealMinesOnGameOver(board: Board, startIdx: number): void {
  for (let i = 0; i < board.cells.length; i++) {
    const cell = board.cells[i];
    if (cell.mine) cell.opened = true;
    if (i === startIdx) cell.opened = true;
  }
}
