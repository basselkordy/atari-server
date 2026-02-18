import Matter from "matter-js";

// --- Collision Categories ---

export const COLLISION_CATEGORIES = {
  WALL: 0x0001,
  PLATFORM: 0x0002,
  PLAYER: 0x0004,
};

// --- Intents ---

export interface PlayerIntent {
  left: boolean;
  right: boolean;
  down: boolean;
  jump: boolean;
}

// --- Dynamic Bodies ---

export interface DynamicBody {
  body: Matter.Body;
  grounded: boolean;
  jumpsUsed: number;
  droppingUntil: number;
  standingOnPlatform: boolean;
}

// --- Static Bodies ---

export type StaticBodyType = "wall" | "platform";

export interface StaticBody {
  body: Matter.Body;
  type: StaticBodyType;
}
