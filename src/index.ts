import express from "express";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { hri } from "human-readable-ids";

import logger from "./logger";

const PORT = Number(process.env.PORT);
const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  const port = req.socket.remotePort;
  logger.info(
    `Upgrade successful: Connection from ${ip}:${port} is now a websocket`,
  );

  ws.on("message", (data) => {
    logger.info(`Received message: ${data}`);

    wss.clients.forEach((client) => {
      client.send(`${ip}:${port} says "${data}"`);
    });
  });
});

app.get("/", (req, res) => {
  logger.info("Root endpoint hit");
  res.send("hello world " + hri.random());
});

server.listen(PORT, () => {
  logger.info(`🚀 Server listening on port ${PORT}`);
});
