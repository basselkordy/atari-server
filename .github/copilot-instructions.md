# Copilot Instructions

- Physics uses Matter.js in `StateManager` with static walls and square bodies.
- World updates run on a fixed 60 FPS tick via `SessionManager.startTickLoop()`.
- `StateManager.tick(deltaMs)` advances physics; `SessionManager` broadcasts SYNC each tick.
