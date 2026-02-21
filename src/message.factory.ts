import { Message } from "./network/types";
import { Dot, GameMap } from "./types";

export class MessageFactory {
  static createWelcome(
    clientId: string,
    snapshot: { dots: Dot[]; map: GameMap },
  ): Message {
    return {
      type: "WELCOME",
      payload: {
        id: clientId,
        worldState: snapshot.dots,
        map: snapshot.map,
      },
    };
  }

  static createSync(
    snapshot: { dots: Dot[]; map: GameMap },
    lastIntentSeq: number | null,
    lastIntentSentAt: number | null,
    physicsDurationMs: number,
    broadcastDurationMs: number,
  ): Message {
    return {
      type: "SYNC",
      payload: {
        worldState: snapshot.dots,
        map: snapshot.map,
        lastIntentSeq,
        lastIntentSentAt,
        physicsDurationMs,
        broadcastDurationMs,
      },
    };
  }

  static createPong(clientTime: number, serverTime: number): Message {
    return {
      type: "PONG",
      payload: { clientTime, serverTime },
    };
  }
}
