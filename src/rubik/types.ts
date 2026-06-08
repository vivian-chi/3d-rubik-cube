import * as THREE from "three";
import type { AxisName } from "./math";

/** One of the 27 little cubes and its committed (settled) state. */
export type CubeletData = {
  id: number;
  /** Solved-state grid coords — used to restore on reset. */
  home: { x: number; y: number; z: number };
  /** Logical grid coords in {-1,0,1}. */
  grid: { x: number; y: number; z: number };
  /** Committed (settled) local transform. */
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  obj: THREE.Group | null;
};

/** A single 90° layer turn. `t` is animation progress 0..1; `dur` its length in seconds. */
export type Turn = {
  axis: AxisName;
  layer: number; // which slice: -1, 0, or 1
  dir: number; // +1 / -1 (rotation direction about the positive axis)
  t: number; // 0..1 animation progress
  dur: number; // seconds for this turn (user turns are slower than scramble turns)
};

/** A queued turn before it starts animating (no progress/duration yet). */
export type TurnSpec = Pick<Turn, "axis" | "layer" | "dir">;
