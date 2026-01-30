import express from "express";
import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { hri } from "human-readable-ids";

import logger from "./logger";
import { World } from "./world";

const PORT = Number(process.env.PORT);
const app = express();
const server = createServer(app);

// Message types
type MessageType = "WELCOME" | "SYNC";

export interface Message<T> {
  type: MessageType;
  payload: T;
}

type WelcomePayload = {
  id: string;
  worldState: ReturnType<typeof world.getSnapshot>;
};

type SyncPayload = {
  worldState: ReturnType<typeof world.getSnapshot>;
};

// Helper functions for creating messages
function createWelcomeMessage(clientId: string): Message<WelcomePayload> {
  return {
    type: "WELCOME",
    payload: {
      id: clientId,
      worldState: world.getSnapshot(),
    },
  };
}

function createSyncMessage(): Message<SyncPayload> {
  return {
    type: "SYNC",
    payload: {
      worldState: world.getSnapshot(),
    },
  };
}

function broadcastSync() {
  const message = JSON.stringify(createSyncMessage());
  let sentCount = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      sentCount++;
    }
  });
  logger.info(`Broadcasted SYNC to ${sentCount} client(s)`);
}

const wss = new WebSocketServer({ server });

const players = new Map<WebSocket, { id: string; host: string }>();
const world = new World();

wss.on("connection", (ws, req) => {
  const host = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
  const id = hri.random();

  players.set(ws, { id: id, host: host });
  world.addDot(id);

  logger.info(
    `Upgrade successful: Connection from ${host} (${id}) is now a websocket`,
  );

  // Send WELCOME to the new client
  const welcomePayload = JSON.stringify(createWelcomeMessage(id));
  ws.send(welcomePayload);
  logger.info(`Sent WELCOME ${welcomePayload} to ${id}`);

  // Broadcast SYNC to all clients (including the new one)
  broadcastSync();

  ws.on("message", (data) => {
    logger.info(`Received message: ${data}`);
  });

  ws.on("close", () => {
    logger.info(`Client ${id} disconnected`);
    players.delete(ws);
    world.removeDot(id);

    // Broadcast SYNC to remaining clients
    broadcastSync();
  });
});

app.get("/", (req, res) => {
  logger.info("Root endpoint hit");
  res.send("hello world " + hri.random());
});

server.listen(PORT, () => {
  logger.info(`🚀 Server listening on port ${PORT}`);
});
