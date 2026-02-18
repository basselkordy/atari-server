import Matter from "matter-js";
import {
  COLLISION_CATEGORIES,
  DynamicBody,
  PlayerIntent,
  StaticBodyType,
} from "./types";

export class PhysicsManager {
  private dynamicBodies: Map<string, DynamicBody>;
  private engine: Matter.Engine;
  private readonly moveSpeed = 5;
  private readonly jumpForce = -8;

  constructor() {
    this.dynamicBodies = new Map();
    this.engine = Matter.Engine.create();
    this.engine.gravity.y = 1;

    this.registerCollisionEvents();
  }

  private registerCollisionEvents(): void {
    Matter.Events.on(this.engine, "collisionStart", (event) => {
      for (const pair of event.pairs) {
        this.updateGroundedState(pair, true);
      }
    });

    Matter.Events.on(this.engine, "collisionEnd", (event) => {
      for (const pair of event.pairs) {
        this.updateGroundedState(pair, false);
      }
    });
  }

  private updateGroundedState(pair: Matter.Pair, isStart: boolean): void {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    let playerBody: Matter.Body | null = null;
    let groundBody: Matter.Body | null = null;

    if (bodyA.collisionFilter.category === COLLISION_CATEGORIES.PLAYER) {
      playerBody = bodyA;
      groundBody = bodyB;
    } else if (bodyB.collisionFilter.category === COLLISION_CATEGORIES.PLAYER) {
      playerBody = bodyB;
      groundBody = bodyA;
    }

    if (!playerBody || !groundBody) return;

    const isGround =
      groundBody.collisionFilter.category === COLLISION_CATEGORIES.WALL ||
      groundBody.collisionFilter.category === COLLISION_CATEGORIES.PLATFORM;

    if (!isGround) return;

    const dynamic = this.dynamicBodies.get(playerBody.label)!;

    // Only count as grounded if dynamic body is above the static body
    if (playerBody.position.y >= groundBody.position.y) return;

    const isPlatform =
      groundBody.collisionFilter.category === COLLISION_CATEGORIES.PLATFORM;

    if (isStart) {
      dynamic.grounded = true;
      dynamic.jumpsUsed = 0;
      dynamic.standingOnPlatform = isPlatform;
    } else {
      dynamic.grounded = false;
      dynamic.standingOnPlatform = false;
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
      collisionFilter: {
        category: COLLISION_CATEGORIES.PLAYER,
        mask: COLLISION_CATEGORIES.WALL | COLLISION_CATEGORIES.PLATFORM,
      },
    });
    Matter.World.add(this.engine.world, body);
    this.dynamicBodies.set(id, {
      body,
      grounded: false,
      jumpsUsed: 0,
      droppingUntil: 0,
      standingOnPlatform: false,
    });
  }

  addStaticBody(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    type: StaticBodyType,
  ): void {
    const category =
      type === "platform"
        ? COLLISION_CATEGORIES.PLATFORM
        : COLLISION_CATEGORIES.WALL;

    const body = Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      label: id,
      collisionFilter: {
        category,
      },
    });
    Matter.World.add(this.engine.world, body);
  }

  removeBody(id: string): void {
    const dynamic = this.dynamicBodies.get(id);
    if (dynamic) {
      Matter.World.remove(this.engine.world, dynamic.body);
      this.dynamicBodies.delete(id);
    }
  }

  tick(deltaMs: number, intents: Map<string, PlayerIntent>): void {
    this.applyIntents(intents);
    Matter.Engine.update(this.engine, deltaMs);
  }

  private applyIntents(intents: Map<string, PlayerIntent>): void {
    const now = Date.now();

    for (const [id, intent] of intents) {
      const dynamic = this.dynamicBodies.get(id);
      if (!dynamic) continue;

      // Handle drop-through: start timer if pressing down while grounded on platform
      if (
        intent.down &&
        dynamic.grounded &&
        dynamic.standingOnPlatform &&
        dynamic.droppingUntil === 0
      ) {
        dynamic.droppingUntil = now + 300; // 300ms drop-through window
      }

      // Calculate collision mask
      const isDroppingThrough = now < dynamic.droppingUntil;
      const isMovingUp = dynamic.body.velocity.y < 0;
      const shouldIgnorePlatforms = isDroppingThrough || isMovingUp;

      const newMask = shouldIgnorePlatforms
        ? COLLISION_CATEGORIES.WALL
        : COLLISION_CATEGORIES.WALL | COLLISION_CATEGORIES.PLATFORM;

      if (dynamic.body.collisionFilter.mask !== newMask) {
        dynamic.body.collisionFilter.mask = newMask;
      }

      // Reset dropping timer if no longer dropping
      if (!isDroppingThrough && dynamic.droppingUntil > 0) {
        dynamic.droppingUntil = 0;
      }

      // Apply movement
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
