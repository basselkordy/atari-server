import { IncomingMessage } from "node:http";
import { Player } from "./types";
import { WebSocket } from "ws";

// @ts-ignore
import { hri } from "human-readable-ids";
import logger from "./logger";
import { StateManager } from "./state.manager";
import { NetworkManager } from "./network.manager";
import { MessageFactory } from "./message.factory";

export class SessionManager {
  private players: Map<WebSocket, Player>;
  private readonly tickRateMs = 1000 / 60;

  constructor(
    private world: StateManager,
    private network: NetworkManager,
  ) {
    this.players = new Map<WebSocket, Player>();
    this.startTickLoop();
  }

  public handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const playerId = this.addPlayer(ws, req);
    this.world.addDot(playerId);

    // Send WELCOME
    const welcomeMessage = MessageFactory.createWelcome(
      playerId,
      this.world.getSnapshot(),
    );
    ws.send(JSON.stringify(welcomeMessage));
    logger.info(`Sent WELCOME to ${playerId}`);

    // Setup event handlers
    ws.on("message", (data) => {
      logger.debug(`Received message from ${playerId}: ${data}`);
      const message = JSON.parse(data.toString());
      this.handleMessage(message);
    });

    ws.on("close", () => {
      logger.info(`Client ${playerId} disconnected`);
      this.removePlayer(ws);
      this.world.removeDot(playerId);
    });
  }

  private handleMessage(message: any): void {
    if (message.type === "INTENT") {
      this.world.move(
        message.payload.id,
        message.payload.deltaX,
        message.payload.deltaY,
      );
    } else {
      logger.info("Unknown message type:", message.type);
    }
  }

  private startTickLoop(): void {
    setInterval(() => {
      this.world.tick(this.tickRateMs);
      this.broadcastSync();
    }, this.tickRateMs);
  }

  private broadcastSync(): void {
    const message = MessageFactory.createSync(this.world.getSnapshot());
    this.network.broadcast(message);
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
