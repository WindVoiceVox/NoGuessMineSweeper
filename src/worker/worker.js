import { generateNoGuessBoard } from "./generate.js";
import { WorkerMessageType } from "./protocol.js";

self.onmessage = (ev) => {
  const msg = ev.data;
  if (!msg || msg.type !== WorkerMessageType.GENERATE) return;
  const response = generateNoGuessBoard(msg);
  self.postMessage(response);
};
