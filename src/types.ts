// MESSAGES
export type MessageType = "WELCOME" | "SYNC";
export interface Message {
  type: MessageType;
  payload: any;
}
type WelcomePayload = {
  id: string;
  worldState: Dot[];
};
type SyncPayload = {
  worldState: Dot[];
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


