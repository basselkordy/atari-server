import Matter from "matter-js";

export class PhysicsManager {
  private bodies: Map<string, Matter.Body>;
  private engine: Matter.Engine;

  constructor() {
    this.bodies = new Map();
    this.engine = Matter.Engine.create();
    this.engine.gravity.y = 0.2; // No gravity for top-down view
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

  addStaticBody(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const body = Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      label: id,
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
}
