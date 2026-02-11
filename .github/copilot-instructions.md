# Copilot Instructions

- Physics uses Matter.js in `PhysicsManager` (engine, bounds, walls, bodies). `StateManager` holds dot state and delegates physics calls.
- World updates run on a fixed 60 FPS tick via `SessionManager.startTickLoop()`.
- `StateManager.tick(deltaMs)` advances physics; `SessionManager` broadcasts SYNC each tick.
- Bots are created and moved in `BotsManager` with its own interval; enable via `BOTS_ENABLED=true` and set count with `BOTS_COUNT` at startup.
