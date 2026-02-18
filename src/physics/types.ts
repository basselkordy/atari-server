import Matter from "matter-js";

// --- Collision Categories ---

export const COLLISION_CATEGORIES = {
  WALL: 0x0001,
  PLATFORM: 0x0002,
  PLAYER: 0x0004,
};

// --- Config ---

export interface WorldPhysicsConfig {
  gravity: number;
  dropThroughDurationMs: number;
}

export interface PlayerPhysicsConfig {
  moveSpeed: number;
  jumpForce: number;
  friction: number;
  frictionAir: number;
  restitution: number;
  inertia: number;
  chamferRadius: number;
}

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
  config: PlayerPhysicsConfig;
}

// --- Static Bodies ---

export type StaticBodyType = "wall" | "platform";

export interface StaticBody {
  body: Matter.Body;
  type: StaticBodyType;
}
