import { generateNoGuessBoard } from "./generate";
import { GenerateRequest, WorkerResponse } from "./protocol";

self.onmessage = (ev: MessageEvent<GenerateRequest>) => {
  const msg = ev.data;
  if (msg.type !== "GENERATE") return;
  const response = generateNoGuessBoard(msg) as WorkerResponse;
  (self as DedicatedWorkerGlobalScope).postMessage(response);
};
