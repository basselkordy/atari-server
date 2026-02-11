import { Dot, GameMap } from "./types";
import { PhysicsManager } from "./physics.manager";

export class StateManager {
  private dots: Map<string, Dot>;
  private readonly map: GameMap;
  private availableColors: string[];
  private usedColors: Set<string>;
  private readonly dotSize = 50;
  private readonly boundsWidth = 800;
  private readonly boundsHeight = 600;
  private readonly physics: PhysicsManager;

  constructor(physics: PhysicsManager, map: GameMap) {
    this.dots = new Map();
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

  move(playerId: string, deltaX: number, deltaY: number): void {
    this.physics.moveBody(playerId, deltaX, deltaY);
  }

  tick(deltaMs: number): void {
    this.physics.tick(deltaMs);
  }

  removeDot(playerId: string): void {
    const dot = this.dots.get(playerId);
    if (dot) {
      this.usedColors.delete(dot.color);
    }
    this.dots.delete(playerId);
    this.physics.removeBody(playerId);
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
