# Copilot Instructions

## Architecture

- Physics uses Matter.js in `PhysicsManager` (engine, bodies). `StateManager` holds dot state and delegates physics calls.
- Maps are defined in `map.factory.ts` and contain walls and platforms. `StateManager.initializeMap()` translates map objects into static physics bodies.
- World updates run on a fixed 60 FPS tick via `SessionManager.startTickLoop()`.
- `StateManager.tick(deltaMs)` advances physics; `SessionManager` broadcasts SYNC each tick.
- Bots are created and moved in `BotsManager` with its own interval; enable via `BOTS_ENABLED=true` and set count with `BOTS_COUNT` at startup.

## Learning Notes

This is a learning project touching these concepts:

- **WebSocket server architecture**: Real-time game state synchronization pattern (WELCOME/SYNC messages)
- **Physics simulation**: Matter.js 2D physics engine integration (bodies, static objects, collision detection)
- **Game loop**: Fixed timestep tick loop pattern for deterministic physics updates
- **Separation of concerns**: PhysicsManager (simulation) vs StateManager (game state) vs SessionManager (networking)
- **Map/level design**: Factory pattern for level definitions, translating game objects to physics bodies
