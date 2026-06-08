import * as THREE from "three";

/** Center-to-center distance between adjacent cubelets (cubelet size + gap). */
export const SPACING = 0.99;

export type AxisName = "x" | "y" | "z";

export const AXES: Record<AxisName, THREE.Vector3> = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};

/** Snap an arbitrary vector to its dominant grid axis, keeping the sign. */
export function snapToAxis(v: THREE.Vector3): { axis: AxisName; sign: number } {
  const ax = Math.abs(v.x);
  const ay = Math.abs(v.y);
  const az = Math.abs(v.z);
  if (ax >= ay && ax >= az) return { axis: "x", sign: Math.sign(v.x) || 1 };
  if (ay >= az) return { axis: "y", sign: Math.sign(v.y) || 1 };
  return { axis: "z", sign: Math.sign(v.z) || 1 };
}

/** Round a coordinate to the nearest grid slot (-1, 0, 1). */
export function roundGrid(value: number): number {
  return Math.round(value / SPACING);
}

export const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
