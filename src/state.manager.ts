import { Dot, GameMap } from "./types";
import { PhysicsManager } from "./physics/physics.manager";
import { PlayerIntent } from "./physics/types";

export class StateManager {
  private dots: Map<string, Dot>;
  private intents: Map<string, PlayerIntent>;
  private intentDiagnostics: Map<string, { seq: number; sentAt: number }>;
  private pendingRemovals: Set<string>;
  private readonly map: GameMap;
  private availableColors: string[];
  private usedColors: Set<string>;
  private readonly dotSize = 50;
  private readonly boundsWidth = 800;
  private readonly boundsHeight = 600;
  private readonly physics: PhysicsManager;

  constructor(physics: PhysicsManager, map: GameMap) {
    this.dots = new Map();
    this.intents = new Map();
    this.intentDiagnostics = new Map();
    this.pendingRemovals = new Set();
    this.map = map;
    this.availableColors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
    ];
    this.usedColors = new Set();
    this.physics = physics;

    // Add all walls as static bodies
    for (const wall of map.walls) {
      this.physics.addStaticBody(
        wall.id,
        wall.x,
        wall.y,
        wall.width,
        wall.height,
        "wall",
      );
    }

    // Add all platforms as static bodies
    for (const platform of map.platforms) {
      this.physics.addStaticBody(
        platform.id,
        platform.x,
        platform.y,
        platform.width,
        platform.height,
        "platform",
      );
    }
  }

  addDot(playerId: string): void {
    const half = this.dotSize / 2;
    const x = Math.random() * (this.boundsWidth - this.dotSize) + half;
    const y = Math.random() * (this.boundsHeight - this.dotSize) + half;
    const color = this.getAvailableColor();

    this.physics.addBody(playerId, x, y, this.dotSize);

    this.dots.set(playerId, {
      id: playerId,
      x,
      y,
      color,
    });

    this.usedColors.add(color);
  }

  move(
    playerId: string,
    left: boolean,
    right: boolean,
    down: boolean,
    jump: boolean,
    seq: number,
    sentAt: number,
  ): void {
    const existing = this.intents.get(playerId);
    if (existing) {
      existing.left = left;
      existing.right = right;
      existing.down = existing.down || down;
      existing.jump = existing.jump || jump;
    } else {
      this.intents.set(playerId, { left, right, down, jump });
    }
    this.intentDiagnostics.set(playerId, { seq, sentAt });
  }

  getIntentDiagnostic(playerId: string): { seq: number; sentAt: number } | null {
    return this.intentDiagnostics.get(playerId) ?? null;
  }

  tick(deltaMs: number): void {
    this.physics.tick(deltaMs, this.intents);
    this.intents.clear();
  }

  removeDot(playerId: string): void {
    this.pendingRemovals.add(playerId);
  }

  processPendingRemovals(): void {
    for (const playerId of this.pendingRemovals) {
      const dot = this.dots.get(playerId);
      if (dot) {
        this.usedColors.delete(dot.color);
      }
      this.dots.delete(playerId);
      this.intents.delete(playerId);
      this.intentDiagnostics.delete(playerId);
      this.physics.removeBody(playerId);
    }
    this.pendingRemovals.clear();
  }

  getSnapshot(): { dots: Dot[]; map: GameMap } {
    // TODO: Only send map in WELCOME, not every SYNC tick (bandwidth optimization)
    for (const [playerId, dot] of this.dots.entries()) {
      const position = this.physics.getBodyPosition(playerId);
      if (position) {
        dot.x = Number(position.x.toFixed(3));
        dot.y = Number(position.y.toFixed(3));
      }
    }
    return {
      dots: Array.from(this.dots.values()),
      map: this.map,
    };
  }

  private getAvailableColor(): string {
    const unused = this.availableColors.filter((c) => !this.usedColors.has(c));

    if (unused.length === 0) {
      // All colors taken, pick any
      return this.availableColors[
        Math.floor(Math.random() * this.availableColors.length)
      ];
    }

    return unused[Math.floor(Math.random() * unused.length)];
  }
}
