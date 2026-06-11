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
