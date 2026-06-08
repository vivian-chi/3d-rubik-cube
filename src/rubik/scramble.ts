import type { AxisName } from "./math";
import type { TurnSpec } from "./types";

const AXES: AxisName[] = ["x", "y", "z"];
const LAYERS = [-1, 0, 1];
const DIRS = [1, -1];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * A sequence of random layer turns to shuffle the cube. Consecutive turns never
 * share an axis, so no move trivially undoes the previous one.
 */
export function randomTurns(count = 24): TurnSpec[] {
  const turns: TurnSpec[] = [];
  let lastAxis: AxisName | null = null;
  for (let i = 0; i < count; i++) {
    let axis = pick(AXES);
    while (axis === lastAxis) axis = pick(AXES);
    lastAxis = axis;
    turns.push({ axis, layer: pick(LAYERS), dir: pick(DIRS) });
  }
  return turns;
}
