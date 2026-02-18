import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import logger from "../logger";
import { PhysicsManager } from "../physics/physics.manager";
import { PlayerPhysicsConfig, WorldPhysicsConfig } from "../physics/types";

export class ConfigServer {
  constructor(port: number, physics: PhysicsManager) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.patch("/world/physics", (req, res) => {
      const config: Partial<WorldPhysicsConfig> = req.body;
      physics.updateWorldConfig(config);
      logger.info(`Updated world physics config: ${JSON.stringify(config)}`);
      res.json({ ok: true });
    });

    app.patch("/players/:playerId/physics", (req, res) => {
      const { playerId } = req.params;
      const config: Partial<PlayerPhysicsConfig> = req.body;
      physics.updatePlayerConfig(playerId, config);
      logger.info(
        `Updated player ${playerId} physics config: ${JSON.stringify(config)}`,
      );
      res.json({ ok: true });
    });

    const server = createServer(app);
    server.listen(port, () => {
      logger.info(`⚙️  Config server listening on port ${port}`);
    });
  }
}
