export interface Dot {
  id: string;
  x: number;
  y: number;
  color: string;
}

export class World {
  private dots: Map<string, Dot>;

  constructor() {
    this.dots = new Map();
  }

  addDot(playerId: string): void {
    const x = Math.random() * 800;
    const y = Math.random() * 600;
    const color = this.randomColor();

    this.dots.set(playerId, {
      id: playerId,
      x,
      y,
      color,
    });
  }

  move(playerId: string, deltaX: number, deltaY: number): void {
    const dot = this.dots.get(playerId);
    if (dot) {
      dot.x += deltaX;
      dot.y += deltaY;
    }
  }

  removeDot(playerId: string): void {
    this.dots.delete(playerId);
  }

  getSnapshot(): Dot[] {
    return Array.from(this.dots.values());
  }

  private randomColor(): string {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
