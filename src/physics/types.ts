import Matter from "matter-js";

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
}

// --- Static Bodies ---

export type StaticBodyType = "wall" | "platform";

export interface StaticBody {
  body: Matter.Body;
  type: StaticBodyType;
}
