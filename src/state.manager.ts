import { Dot } from "./types";

export class StateManager {
  private dots: Map<string, Dot>;
  private availableColors: string[];
  private usedColors: Set<string>;

  constructor() {
    this.dots = new Map();
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
  }

  addDot(playerId: string): void {
    const x = Math.random() * 450;
    const y = Math.random() * 450;
    const color = this.getAvailableColor();

    this.dots.set(playerId, {
      id: playerId,
      x,
      y,
      color,
    });

    this.usedColors.add(color);
  }

  move(playerId: string, deltaX: number, deltaY: number): void {
    const dot = this.dots.get(playerId);
    if (dot) {
      const newX = dot.x + deltaX;
      const newY = dot.y + deltaY;

      if (this.checkBoundaries(newX, newY)) {
        dot.x = newX;
        dot.y = newY;
      }
    }
  }

  private checkBoundaries(x: number, y: number): boolean {
    return x >= 0 && x <= 450 && y >= 0 && y <= 450;
  }

  removeDot(playerId: string): void {
    const dot = this.dots.get(playerId);
    if (dot) {
      this.usedColors.delete(dot.color);
    }
    this.dots.delete(playerId);
  }

  getSnapshot(): Dot[] {
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
