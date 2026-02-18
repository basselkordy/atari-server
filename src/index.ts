import { IncomingMessage } from "node:http";
import { WebSocket } from "ws";
import { BotsManager } from "./bots.manager";
import { PhysicsManager } from "./physics/physics.manager";
import { StateManager } from "./state.manager";
import { GameServer } from "./network/game.server";
import { ConfigServer } from "./network/config.server";
import { SessionManager } from "./session.manager";
import { BotsConfig } from "./types";
import { createMap } from "./map.factory";

const GAME_PORT = Number(process.env.GAME_PORT);
const CONFIG_PORT = Number(process.env.CONFIG_PORT ?? 3001);
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

const gameServer = new GameServer(GAME_PORT, onConnection);
const configServer = new ConfigServer(CONFIG_PORT, physics);
const sessionManager = new SessionManager(worldStateManager, gameServer);

function onConnection(ws: WebSocket, message: IncomingMessage) {
  sessionManager.handleConnection(ws, message);
}
