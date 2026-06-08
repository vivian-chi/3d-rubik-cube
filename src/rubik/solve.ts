import * as THREE from "three";
import { FACE_NORMALS, faceIndexOf, stickerFacesFor } from "./math";
import type { CubeletData } from "./types";

/**
 * True when every cube face shows a single color.
 *
 * A sticker's color is identified by the home face it started on. For each
 * cubelet we rotate that sticker's original normal by the cubelet's current
 * orientation to learn which face it now points at, then require every sticker
 * landing on a given face to share the same color. Robust to a whole-cube
 * reorientation that still reads as solved.
 */
export function isSolved(cubelets: CubeletData[]): boolean {
  const faceColor: (number | null)[] = [null, null, null, null, null, null];
  const dir = new THREE.Vector3();

  for (const c of cubelets) {
    for (const sticker of stickerFacesFor(c.home)) {
      dir.copy(FACE_NORMALS[sticker]).applyQuaternion(c.quaternion);
      const face = faceIndexOf(dir);
      const color = sticker; // color id == the home face the sticker started on
      if (faceColor[face] === null) faceColor[face] = color;
      else if (faceColor[face] !== color) return false;
    }
  }
  return true;
}
