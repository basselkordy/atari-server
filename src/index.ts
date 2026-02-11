import { IncomingMessage } from "node:http";
import { WebSocket } from "ws";
import { BotsManager } from "./bots.manager";
import { PhysicsManager } from "./physics.manager";
import { StateManager } from "./state.manager";
import { NetworkManager } from "./network.manager";
import { SessionManager } from "./session.manager";
import { BotsConfig } from "./types";

const PORT = Number(process.env.PORT);
const physics = new PhysicsManager();
const world = new StateManager(physics);
const botsConfig: BotsConfig = {
  enabled: process.env.BOTS_ENABLED === "true",
  count: Number(process.env.BOTS_COUNT ?? "0"),
};
if (botsConfig.enabled && botsConfig.count > 0) {
  new BotsManager(world, botsConfig);
}
const network = new NetworkManager(PORT, onConnection);
const sessionManager = new SessionManager(world, network);

function onConnection(ws: WebSocket, message: IncomingMessage) {
  sessionManager.handleConnection(ws, message);
}
