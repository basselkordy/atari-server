// STATE/GAME
export interface Dot {
  id: string;
  x: number;
  y: number;
  color: string;
}

export interface Wall {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameMap {
  walls: Wall[];
  platforms: Platform[];
}

export interface BotsConfig {
  enabled: boolean;
  count: number;
}
