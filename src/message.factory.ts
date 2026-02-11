import { Message, Dot, GameMap } from "./types";

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

  static createSync(snapshot: { dots: Dot[]; map: GameMap }): Message {
    return {
      type: "SYNC",
      payload: {
        worldState: snapshot.dots,
        map: snapshot.map,
      },
    };
  }
}
