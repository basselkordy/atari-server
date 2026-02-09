import { Dot } from "./types";
import Matter from "matter-js";

export class StateManager {
  private dots: Map<string, Dot>;
  private bodies: Map<string, Matter.Body>;
  private walls: Matter.Body[];
  private availableColors: string[];
  private usedColors: Set<string>;
  private engine: Matter.Engine;
  private readonly dotSize = 50;
  private readonly boundsSize = 500;
  private readonly wallThickness = 50;

  constructor() {
    this.dots = new Map();
    this.bodies = new Map();
    this.walls = [];
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
    this.engine = Matter.Engine.create();
    this.engine.gravity.y = 0; // No gravity for top-down view
    this.createWalls();
  }

  addDot(playerId: string): void {
    const half = this.dotSize / 2;
    const x = Math.random() * (this.boundsSize - this.dotSize) + half;
    const y = Math.random() * (this.boundsSize - this.dotSize) + half;
    const color = this.getAvailableColor();

    const body = Matter.Bodies.rectangle(x, y, this.dotSize, this.dotSize, {
      label: playerId,
      restitution: 0.0,
      friction: 0.01,
    });
    Matter.World.add(this.engine.world, body);
    this.bodies.set(playerId, body);

    this.dots.set(playerId, {
      id: playerId,
      x,
      y,
      color,
    });

    this.usedColors.add(color);
  }

  move(playerId: string, deltaX: number, deltaY: number): void {
    const body = this.bodies.get(playerId);
    if (body) {
      // Move by setting velocity or position
      Matter.Body.setVelocity(body, { x: deltaX, y: deltaY });
    }
  }

  tick(deltaMs: number): void {
    Matter.Engine.update(this.engine, deltaMs);
  }

  private createWalls(): void {
    const half = this.boundsSize / 2;
    const thickness = this.wallThickness;
    const offset = thickness / 2;

    const top = Matter.Bodies.rectangle(
      half,
      -offset,
      this.boundsSize + thickness * 2,
      thickness,
      { isStatic: true, label: "wall-top" },
    );
    const bottom = Matter.Bodies.rectangle(
      half,
      this.boundsSize + offset,
      this.boundsSize + thickness * 2,
      thickness,
      { isStatic: true, label: "wall-bottom" },
    );
    const left = Matter.Bodies.rectangle(
      -offset,
      half,
      thickness,
      this.boundsSize + thickness * 2,
      { isStatic: true, label: "wall-left" },
    );
    const right = Matter.Bodies.rectangle(
      this.boundsSize + offset,
      half,
      thickness,
      this.boundsSize + thickness * 2,
      { isStatic: true, label: "wall-right" },
    );

    this.walls = [top, bottom, left, right];
    Matter.World.add(this.engine.world, this.walls);
  }

  removeDot(playerId: string): void {
    const dot = this.dots.get(playerId);
    if (dot) {
      this.usedColors.delete(dot.color);
    }
    this.dots.delete(playerId);
    const body = this.bodies.get(playerId);
    if (body) {
      Matter.World.remove(this.engine.world, body);
      this.bodies.delete(playerId);
    }
  }

  getSnapshot(): Dot[] {
    for (const [playerId, body] of this.bodies.entries()) {
      const dot = this.dots.get(playerId);
      if (dot) {
        dot.x = Number(body.position.x.toFixed(3));
        dot.y = Number(body.position.y.toFixed(3));
      }
    }
    return Array.from(this.dots.values());
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
