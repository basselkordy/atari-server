import { IncomingMessage } from "node:http";
import { WebSocket } from "ws";
import { StateManager } from "./state.manager";
import { NetworkManager } from "./network.manager";
import { SessionManager } from "./session.manager";

const PORT = Number(process.env.PORT);
const world = new StateManager();
const network = new NetworkManager(PORT, onConnection);
const sessionManager = new SessionManager(world, network);

function onConnection(ws: WebSocket, message: IncomingMessage) {
  sessionManager.handleConnection(ws, message);
}
