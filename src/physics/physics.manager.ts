import Matter from "matter-js";
import { DynamicBody, PlayerIntent, StaticBody, StaticBodyType } from "./types";

export class PhysicsManager {
  private dynamicBodies: Map<string, DynamicBody>;
  private staticBodies: Map<string, StaticBody>;
  private engine: Matter.Engine;
  private readonly moveSpeed = 5;
  private readonly jumpForce = -8;

  constructor() {
    this.dynamicBodies = new Map();
    this.staticBodies = new Map();
    this.engine = Matter.Engine.create();
    this.engine.gravity.y = 1;

    this.registerCollisionEvents();
  }

  private registerCollisionEvents(): void {
    Matter.Events.on(this.engine, "collisionStart", (event) => {
      for (const pair of event.pairs) {
        this.handleCollision(pair, true);
      }
    });

    Matter.Events.on(this.engine, "collisionEnd", (event) => {
      for (const pair of event.pairs) {
        this.handleCollision(pair, false);
      }
    });
  }

  private handleCollision(pair: Matter.Pair, isStart: boolean): void {
    const dynamic =
      this.dynamicBodies.get(pair.bodyA.label) ??
      this.dynamicBodies.get(pair.bodyB.label);
    const static_ =
      this.staticBodies.get(pair.bodyA.label) ??
      this.staticBodies.get(pair.bodyB.label);

    if (!dynamic || !static_) return;

    // Only count as grounded if dynamic body is above the static body
    if (dynamic.body.position.y >= static_.body.position.y) return;

    if (isStart) {
      dynamic.grounded = true;
      dynamic.jumpsUsed = 0;
    } else {
      dynamic.grounded = false;
    }
  }

  addBody(id: string, x: number, y: number, size: number): void {
    const body = Matter.Bodies.rectangle(x, y, size, size, {
      label: id,
      restitution: 0.0,
      friction: 0.01,
      frictionAir: 0,
      inertia: Infinity,
      chamfer: { radius: 5 },
    });
    Matter.World.add(this.engine.world, body);
    this.dynamicBodies.set(id, { body, grounded: false, jumpsUsed: 0 });
  }

  addStaticBody(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    type: StaticBodyType,
  ): void {
    const body = Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      label: id,
    });
    Matter.World.add(this.engine.world, body);
    this.staticBodies.set(id, { body, type });
  }

  removeBody(id: string): void {
    const dynamic = this.dynamicBodies.get(id);
    if (dynamic) {
      Matter.World.remove(this.engine.world, dynamic.body);
      this.dynamicBodies.delete(id);
      return;
    }

    const static_ = this.staticBodies.get(id);
    if (static_) {
      Matter.World.remove(this.engine.world, static_.body);
      this.staticBodies.delete(id);
    }
  }

  tick(deltaMs: number, intents: Map<string, PlayerIntent>): void {
    this.applyIntents(intents);
    Matter.Engine.update(this.engine, deltaMs);
  }

  private applyIntents(intents: Map<string, PlayerIntent>): void {
    for (const [id, intent] of intents) {
      const dynamic = this.dynamicBodies.get(id);
      if (!dynamic) continue;

      const speed = this.moveSpeed;
      let vx = 0;
      if (intent.left) vx -= speed;
      if (intent.right) vx += speed;

      let vy = dynamic.body.velocity.y;
      if (intent.jump && dynamic.jumpsUsed < 2) {
        vy = this.jumpForce;
        dynamic.jumpsUsed++;
      }

      Matter.Body.setVelocity(dynamic.body, { x: vx, y: vy });
    }
  }

  getBodyPosition(id: string): { x: number; y: number } | null {
    const dynamic = this.dynamicBodies.get(id);
    if (!dynamic) {
      return null;
    }

    return {
      x: dynamic.body.position.x,
      y: dynamic.body.position.y,
    };
  }
}
