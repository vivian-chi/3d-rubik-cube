import * as THREE from "three";
import type { Palette } from "./materials";

/**
 * Writes per-face vertex colors onto a (smoothed) rounded-box geometry so each
 * flat face shows its palette color and the rounded edges blend between adjacent
 * faces — the soft, gummy clay gradient.
 *
 * Face order matches the palette: [ +x, -x, +y, -y, +z, -z ].
 */
export function applyFaceColors(geometry: THREE.BufferGeometry, palette: Palette) {
  const normal = geometry.attributes.normal;
  const count = normal.count;
  const colors = palette.faces.map((f) => new THREE.Color(f.color));
  const [px, nx, py, ny, pz, nz] = colors;

  const out = new Float32Array(count * 3);
  const c = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const x = normal.getX(i);
    const y = normal.getY(i);
    const z = normal.getZ(i);

    const wx = x * x;
    const wy = y * y;
    const wz = z * z;
    const sum = wx + wy + wz || 1;

    const cx = x >= 0 ? px : nx;
    const cy = y >= 0 ? py : ny;
    const cz = z >= 0 ? pz : nz;

    c.setRGB(
      (cx.r * wx + cy.r * wy + cz.r * wz) / sum,
      (cx.g * wx + cy.g * wy + cz.g * wz) / sum,
      (cx.b * wx + cy.b * wy + cz.b * wz) / sum
    );

    out[i * 3] = c.r;
    out[i * 3 + 1] = c.g;
    out[i * 3 + 2] = c.b;
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(out, 3));
}
