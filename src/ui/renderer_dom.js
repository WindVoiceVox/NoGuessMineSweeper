export function createBoardButtons(root, width, height) {
  root.innerHTML = "";
  root.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;
  const buttons = [];
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

export function renderBoard(model, buttons) {
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
    const classes = ["cell"];
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

export function revealMinesOnGameOver(board, startIdx) {
  for (let i = 0; i < board.cells.length; i++) {
    const cell = board.cells[i];
    if (cell.mine) cell.opened = true;
    if (i === startIdx) cell.opened = true;
  }
}
