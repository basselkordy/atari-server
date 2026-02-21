import { IncomingMessage } from "node:http";
import { Player } from "./network/types";
import { WebSocket } from "ws";

// @ts-ignore
import { hri } from "human-readable-ids";
import logger from "./logger";
import { StateManager } from "./state.manager";
import { GameServer } from "./network/game.server";
import { MessageFactory } from "./message.factory";

export class SessionManager {
  private players: Map<WebSocket, Player>;
  private readonly tickRateMs = 1000 / 60;
  private lastBroadcastDurationMs = 0;

  constructor(
    private stateManager: StateManager,
    private gameServer: GameServer,
  ) {
    this.players = new Map<WebSocket, Player>();
    this.startTickLoop();
  }

  public handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const playerId = this.addPlayer(ws, req);
    this.stateManager.addDot(playerId);

    // Send WELCOME
    const welcomeMessage = MessageFactory.createWelcome(
      playerId,
      this.stateManager.getSnapshot(),
    );
    ws.send(JSON.stringify(welcomeMessage));
    logger.info(`Sent WELCOME to ${playerId}`);

    // Setup event handlers
    ws.on("message", (data) => {
      logger.debug(`Received message from ${playerId}: ${data}`);
      const message = JSON.parse(data.toString());
      this.handleMessage(ws, message);
    });

    ws.on("close", () => {
      logger.info(`Client ${playerId} disconnected`);
      this.removePlayer(ws);
      this.stateManager.removeDot(playerId);
    });
  }

  private handleMessage(ws: WebSocket, message: any): void {
    if (message.type === "INTENT") {
      this.stateManager.move(
        message.payload.id,
        message.payload.left,
        message.payload.right,
        message.payload.down,
        message.payload.jump,
        message.payload.seq ?? 0,
        message.payload.sentAt ?? 0,
      );
    } else if (message.type === "PING") {
      if (ws.readyState === ws.OPEN) {
        const pong = MessageFactory.createPong(
          message.payload.clientTime,
          Date.now(),
        );
        ws.send(JSON.stringify(pong));
      }
    } else {
      logger.info("Unknown message type:", message.type);
    }
  }

  private startTickLoop(): void {
    setInterval(() => {
      // Measure physics duration
      const physicsStart = Date.now();
      this.stateManager.tick(this.tickRateMs);
      const physicsDurationMs = Date.now() - physicsStart;

      this.stateManager.processPendingRemovals();

      // Measure broadcast duration (measures JSON serialization + ws.send hand-off,
      // NOT wire transmission time — ws.send() returns before bytes leave the machine)
      const broadcastStart = Date.now();
      this.broadcastSync(physicsDurationMs);
      this.lastBroadcastDurationMs = Date.now() - broadcastStart;
    }, this.tickRateMs);
  }

  private broadcastSync(physicsDurationMs: number): void {
    const snapshot = this.stateManager.getSnapshot();

    this.players.forEach((player, ws) => {
      if (ws.readyState !== ws.OPEN) return;

      const diagnostic = this.stateManager.getIntentDiagnostic(player.id);
      const message = MessageFactory.createSync(
        snapshot,
        diagnostic?.seq ?? null,
        diagnostic?.sentAt ?? null,
        physicsDurationMs,
        this.lastBroadcastDurationMs,
      );
      ws.send(JSON.stringify(message));
    });
  }

  private addPlayer(ws: WebSocket, message: IncomingMessage): string {
    const host = `${message.socket.remoteAddress}:${message.socket.remotePort}`;
    const id = hri.random();
    this.players.set(ws, { id: id, host: host });
    logger.info(
      `Upgrade successful: Connection from ${host} (${id}) is now a websocket`,
    );

    return id;
  }

  private removePlayer(ws: WebSocket): void {
    logger.info(`${this.players.get(ws)?.id} left. adios`);
    this.players.delete(ws);
  }
}
