import Matter from "matter-js";

export class PhysicsManager {
  private bodies: Map<string, Matter.Body>;
  private walls: Matter.Body[];
  private engine: Matter.Engine;
  private readonly boundsWidth: number;
  private readonly boundsHeight: number;
  private readonly wallThickness: number;

  constructor(options?: {
    boundsWidth?: number;
    boundsHeight?: number;
    wallThickness?: number;
  }) {
    this.bodies = new Map();
    this.walls = [];
    this.boundsWidth = options?.boundsWidth ?? 800;
    this.boundsHeight = options?.boundsHeight ?? 600;
    this.wallThickness = options?.wallThickness ?? 50;

    this.engine = Matter.Engine.create();
    this.engine.gravity.y = 0; // No gravity for top-down view
    this.createWalls();
  }

  addBody(id: string, x: number, y: number, size: number): void {
    const body = Matter.Bodies.rectangle(x, y, size, size, {
      label: id,
      restitution: 0.0,
      friction: 0.01,
    });
    Matter.World.add(this.engine.world, body);
    this.bodies.set(id, body);
  }

  removeBody(id: string): void {
    const body = this.bodies.get(id);
    if (body) {
      Matter.World.remove(this.engine.world, body);
      this.bodies.delete(id);
    }
  }

  moveBody(id: string, deltaX: number, deltaY: number): void {
    const body = this.bodies.get(id);
    if (!body) {
      return;
    }

    Matter.Body.setPosition(body, {
      x: body.position.x + deltaX,
      y: body.position.y + deltaY,
    });
  }

  tick(deltaMs: number): void {
    Matter.Engine.update(this.engine, deltaMs);
  }

  getBodyPosition(id: string): { x: number; y: number } | null {
    const body = this.bodies.get(id);
    if (!body) {
      return null;
    }

    return {
      x: body.position.x,
      y: body.position.y,
    };
  }

  private createWalls(): void {
    const halfWidth = this.boundsWidth / 2;
    const halfHeight = this.boundsHeight / 2;
    const thickness = this.wallThickness;
    const offset = thickness / 2;

    const top = Matter.Bodies.rectangle(
      halfWidth,
      -offset,
      this.boundsWidth + thickness * 2,
      thickness,
      { isStatic: true, label: "wall-top" },
    );
    const bottom = Matter.Bodies.rectangle(
      halfWidth,
      this.boundsHeight + offset,
      this.boundsWidth + thickness * 2,
      thickness,
      { isStatic: true, label: "wall-bottom" },
    );
    const left = Matter.Bodies.rectangle(
      -offset,
      halfHeight,
      thickness,
      this.boundsHeight + thickness * 2,
      { isStatic: true, label: "wall-left" },
    );
    const right = Matter.Bodies.rectangle(
      this.boundsWidth + offset,
      halfHeight,
      thickness,
      this.boundsHeight + thickness * 2,
      { isStatic: true, label: "wall-right" },
    );

    this.walls = [top, bottom, left, right];
    Matter.World.add(this.engine.world, this.walls);
  }
}
