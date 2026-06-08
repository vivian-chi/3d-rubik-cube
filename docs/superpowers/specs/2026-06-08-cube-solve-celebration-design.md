# Cube Solve Celebration — Design

Date: 2026-06-08

## Goal
When a user genuinely solves the Rubik's cube (not via the manual Reset), play an
energetic, dynamic celebration: an excited jump, a slow→fast spin, an outward
explosion of the cubelets (fast→slow) that holds at full extent, then a reassembly
back into the cube and a couple of victory bounces. Meanwhile a "Good job! 🎉 Wanna
try again?" message fades in.

## Win detection
The cube loads solved and has no scramble today, so we add:

- **`src/rubik/scramble.ts`** — `randomTurns(n)` produces ~20 random layer turns
  (`{ axis, layer, dir }`). The Scramble button feeds these into a new `turnQueue`
  ref that the existing `useFrame` turn-animator drains one at a time, reusing the
  current turn system for a rapid shuffle. After a scramble starts, a `scrambled`
  ref flag is set true.
- **`src/rubik/solve.ts`** — `isSolved(cubelets)` checks **face uniformity**: for
  each of the 6 cube faces, every outward-pointing sticker shares one color,
  computed from each cubelet's current quaternion. Robust to a whole-cube-rotated
  solve.
- After each turn **commits** in `RubikCube`, if `scrambled && isSolved()` →
  start celebration and clear `scrambled`. Initial load and Reset never set
  `scrambled`, so they never celebrate.

## Celebration choreography
**`src/rubik/celebration.ts`** builds and returns a GSAP timeline. On solve,
`RubikCube` snapshots every cubelet's current position/quaternion and the group's
rotation, sets a `celebrating` ref (so `useFrame` and pointer handlers bail and
GSAP owns the objects), then plays:

| # | Phase | Motion | Ease / timing |
|---|-------|--------|---------------|
| 1 | Excited jump | group hops up once with slight squash | `back.out` · ~0.4s |
| 2 | Spin | group spins on Y, slow→fast, several turns | `power3.in` · 3s |
| 3 | Explode | each cubelet flies radially outward (direction from center + slight randomness), fast→slow | `power3.out` · ~0.8s |
| 4 | Hold | dwell at max extent with a gentle drift | ~1.5s |
| 5 | Reassemble | cubelets snap back to snapshot; group rotation eases back to start angle | `back.out` · ~1s |
| 6 | Final jumps | group bounces 1–2 times | `bounce`/`back.out` · ~0.8s |

A timeline callback at phase 5 fires `onSolved()` so the message appears during
reassemble + final jumps. On complete, `celebrating` clears and input re-enables.
Total ≈ 7.5s.

## Message
**`src/Celebration.tsx`** — animated DOM overlay (CSS pop/fade-in) reading
"Good job! 🎉 Wanna try again?" with a **Try again** button that re-scrambles and
dismisses. Styled to match the frosted `Controls` panel.

## Wiring
- **`src/App.tsx`** — adds `scrambleSignal` and `showCelebration` state; passes
  `scrambleSignal` + `onSolved` to `RubikCube`; renders `<Celebration>`.
- **`src/Controls.tsx`** — adds a 🔀 Scramble button.
- **`package.json`** — adds `gsap`.

## File-split rationale
`RubikCube.tsx` is already ~257 lines. Solve/scramble/celebration go into focused
modules so each is independently readable and testable.
