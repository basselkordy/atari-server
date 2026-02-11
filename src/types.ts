// MESSAGES
export type MessageType = "WELCOME" | "SYNC";
export interface Message {
  type: MessageType;
  payload: any;
}
type WelcomePayload = {
  id: string;
  worldState: Dot[];
  map: GameMap;
};
type SyncPayload = {
  worldState: Dot[];
  map: GameMap;
};

// SESSION
export interface Player {
  id: string;
  host: string;
}

// STATE/GAME
export interface Dot {
  id: string;
  x: number;
  y: number;
  color: string;
}

export interface Wall {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameMap {
  walls: Wall[];
  platforms: Platform[];
}

export interface BotsConfig {
  enabled: boolean;
  count: number;
}
