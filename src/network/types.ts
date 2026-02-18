// --- Messages ---

export type MessageType = "WELCOME" | "SYNC" | "INTENT";

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
};

export type IntentPayload = {
  id: string;
  left: boolean;
  right: boolean;
  down: boolean;
  jump: boolean;
};

// --- Session ---

export interface Player {
  id: string;
  host: string;
}
