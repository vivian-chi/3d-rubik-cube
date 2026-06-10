import * as THREE from "three";

/**
 * Data-driven palettes + material config.
 *
 * Each face entry is currently just a color. This is the seam for the future
 * "faces -> projects" upgrade: extend `Face` to `{ color, label, url }` and the
 * rest of the app keeps working.
 *
 * Face order matches BoxGeometry material/group order:
 *   [ +x (right), -x (left), +y (top), -y (bottom), +z (front), -z (back) ]
 */
export type Face = {
  color: string;
};

export type Palette = {
  name: string;
  /** The 7th color: the plastic body / gaps between stickers. */
  body: string;
  faces: [Face, Face, Face, Face, Face, Face];
};

const faces = (colors: [string, string, string, string, string, string]): Palette["faces"] =>
  colors.map((color) => ({ color })) as Palette["faces"];

export const PALETTES: Palette[] = [
  {
    // Sampled from the marshmallow-candy reference: creamy coral / sage /
    // butter / apricot / periwinkle / blush. [ +x, -x, +y, -y, +z, -z ]
    name: "Marshmallow",
    body: "#fdfaf5",
    faces: faces(["#e96b4a", "#6cbb58", "#f4c52f", "#ec8c3a", "#6480e9", "#f08bb1"]),
  },
  {
    name: "Candy",
    body: "#f7f0ff",
    faces: faces(["#ff5fa2", "#9b5cff", "#3db8ff", "#54e0c7", "#ffd23d", "#ff7a9c"]),
  },
  {
    name: "Jelly Rainbow",
    body: "#f2f4f8",
    faces: faces(["#ff3b5c", "#ff8c2b", "#ffd02b", "#46d66f", "#2bb6ff", "#a35cff"]),
  },
];

export type MaterialMode = "velvet" | "matte";

/**
 * Procedural grayscale grain used as a fine bump/roughness map. Driven at high
 * tiling it reads as the peach-fuzz micro-texture of the velvet mode without any
 * custom shaders.
 */
export function makeNoiseTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    // Bias toward mid-gray so the grain stays subtle, not harsh.
    const v = 110 + Math.random() * 90;
    image.data[i] = v;
    image.data[i + 1] = v;
    image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.needsUpdate = true;
  return texture;
}
