import { StateManager } from "./state.manager";
import { BotsConfig } from "./types";

export class BotsManager {
  private readonly state: StateManager;
  private readonly botIds: string[];
  private readonly tickIntervalMs = 100;
  private timer: NodeJS.Timeout | null;

  constructor(state: StateManager, config: BotsConfig) {
    this.state = state;
    this.botIds = [];
    this.timer = null;

    if (!config.enabled || config.count <= 0) {
      return;
    }

    this.initializeBots(config.count);
    this.startTickLoop();
  }

  private initializeBots(count: number): void {
    for (let i = 1; i <= count; i += 1) {
      const botId = `bot-${i}`;
      this.botIds.push(botId);
      this.state.addDot(botId);
    }
  }

  private startTickLoop(): void {
    this.timer = setInterval(() => {
      this.tick();
    }, this.tickIntervalMs);
  }

  private tick(): void {
    for (const botId of this.botIds) {
      const left = Math.random() < 0.3;
      const right = !left && Math.random() < 0.3;
      const jump = Math.random() < 0.1;
      this.state.move(botId, left, right, false, jump);
    }
  }
}
