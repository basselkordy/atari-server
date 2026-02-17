import { IncomingMessage } from "node:http";
import { WebSocket } from "ws";
import { BotsManager } from "./bots.manager";
import { PhysicsManager } from "./physics/physics.manager";
import { StateManager } from "./state.manager";
import { NetworkManager } from "./network.manager";
import { SessionManager } from "./session.manager";
import { BotsConfig } from "./types";
import { createMap } from "./map.factory";

const PORT = Number(process.env.PORT);
const physics = new PhysicsManager();
const map = createMap();
const worldStateManager = new StateManager(physics, map);

const botsConfig: BotsConfig = {
  enabled: process.env.BOTS_ENABLED === "true",
  count: Number(process.env.BOTS_COUNT ?? "0"),
};
if (botsConfig.enabled && botsConfig.count > 0) {
  new BotsManager(worldStateManager, botsConfig);
}

const network = new NetworkManager(PORT, onConnection);
const sessionManager = new SessionManager(worldStateManager, network);

function onConnection(ws: WebSocket, message: IncomingMessage) {
  sessionManager.handleConnection(ws, message);
}
