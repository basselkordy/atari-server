import { Message } from "./types";
import { Dot } from "./types"

export class MessageFactory {
  static createWelcome(clientId: string, worldState: Dot[]): Message {
    return {
      type: "WELCOME",
      payload: {
        id: clientId,
        worldState,
      },
    };
  }

  static createSync(worldState: Dot[]): Message {
    return {
      type: "SYNC",
      payload: {
        worldState,
      },
    };
  }
}
