import { Board } from "../game/types";

export type GenerateRequest = {
  type: "GENERATE";
  width: number;
  height: number;
  mineCount: number;
  startX: number;
  startY: number;
  safeRadius: number;
  maxAttempts: number;
  seed?: string;
};

export type GenerateOk = {
  type: "GENERATE_OK";
  board: Board;
  attempts: number;
  seed?: string;
};

export type GenerateFail = {
  type: "GENERATE_FAIL";
  attempts: number;
  reason: string;
};

export type WorkerResponse = GenerateOk | GenerateFail;
