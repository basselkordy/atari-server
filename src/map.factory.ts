import { GameMap, Wall, Platform } from "./types";

export function createMap(): GameMap {
  const boundsWidth = 800;
  const boundsHeight = 600;
  const wallThickness = 50;

  const walls: Wall[] = [
    {
      id: "wall-top",
      x: boundsWidth / 2,
      y: -(wallThickness / 2),
      width: boundsWidth + wallThickness * 2,
      height: wallThickness,
    },
    {
      id: "wall-bottom",
      x: boundsWidth / 2,
      y: boundsHeight + wallThickness / 2,
      width: boundsWidth + wallThickness * 2,
      height: wallThickness,
    },
    {
      id: "wall-left",
      x: -(wallThickness / 2),
      y: boundsHeight / 2,
      width: wallThickness,
      height: boundsHeight + wallThickness * 2,
    },
    {
      id: "wall-right",
      x: boundsWidth + wallThickness / 2,
      y: boundsHeight / 2,
      width: wallThickness,
      height: boundsHeight + wallThickness * 2,
    },
  ];

  const platforms: Platform[] = [
    {
      id: "platform-1",
      x: 200,
      y: 400,
      width: 150,
      height: 20,
    },
    {
      id: "platform-2",
      x: 600,
      y: 300,
      width: 150,
      height: 20,
    },
    {
      id: "platform-3",
      x: 400,
      y: 200,
      width: 200,
      height: 20,
    },
  ];

  return { walls, platforms };
}
