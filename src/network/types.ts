// --- Messages ---

export type MessageType = "WELCOME" | "SYNC" | "INTENT" | "PING" | "PONG";

export interface Message {
  type: MessageType;
  payload: any;
}

export type WelcomePayload = {
  id: string;
  worldState: import("../types").Dot[];
  map: import("../types").GameMap;
};

export type SyncPayload = {
  worldState: import("../types").Dot[];
  map: import("../types").GameMap;
  lastIntentSeq: number | null;
  lastIntentSentAt: number | null;
  physicsDurationMs: number;
  broadcastDurationMs: number;
};

export type IntentPayload = {
  id: string;
  left: boolean;
  right: boolean;
  down: boolean;
  jump: boolean;
  seq: number;
  sentAt: number;
};

export type PingPayload = {
  clientTime: number;
};

export type PongPayload = {
  clientTime: number;
  serverTime: number;
};

// --- Session ---

export interface Player {
  id: string;
  host: string;
}
