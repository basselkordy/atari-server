import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import logger from "../logger";
import { Message } from "./types";

export class GameServer {
  private wss: WebSocketServer;

  constructor(port: number, onConnection: Function) {
    const server = createServer();
    this.wss = new WebSocketServer({ server });
    this.wss.on("connection", (ws, req) => onConnection(ws, req));

    server.listen(port, () => {
      logger.info(`🎮 Game server listening on port ${port}`);
    });
  }

  public broadcast(message: Message) {
    let sentCount = 0;
    const payload = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
        sentCount++;
      }
    });
    logger.debug(`Broadcasted ${message.type} to ${sentCount} client(s)`);
  }

  public send(ws: WebSocket, message: Message) {
    const payload = JSON.stringify(message);
    logger.info(`Sent ${message}`);
    ws.send(payload);
  }
}
