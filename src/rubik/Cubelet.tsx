import { forwardRef } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Palette } from "../materials";

/**
 * Sticker face order matches the palette face order:
 *   0:+x  1:-x  2:+y  3:-y  4:+z  5:-z
 * Each entry is where a sticker tile sits on the cubelet body.
 */
const STICKER_TRANSFORMS: {
  position: [number, number, number];
  rotation: [number, number, number];
}[] = [
  { position: [0.47, 0, 0], rotation: [0, Math.PI / 2, 0] }, // +x
  { position: [-0.47, 0, 0], rotation: [0, -Math.PI / 2, 0] }, // -x
  { position: [0, 0.47, 0], rotation: [-Math.PI / 2, 0, 0] }, // +y
  { position: [0, -0.47, 0], rotation: [Math.PI / 2, 0, 0] }, // -y
  { position: [0, 0, 0.47], rotation: [0, 0, 0] }, // +z
  { position: [0, 0, -0.47], rotation: [0, Math.PI, 0] }, // -z
];

type CubeletProps = {
  /** Which outward faces carry a colored sticker (indices into STICKER_TRANSFORMS). */
  stickerFaces: number[];
  palette: Palette;
  onPointerDown: (e: import("@react-three/fiber").ThreeEvent<PointerEvent>) => void;
};

/**
 * One of the 27 little cubes: a soft matte body in the palette's body color,
 * plus one vivid rounded sticker tile per outward-facing side. Classic Rubik
 * structure (1 body color + 6 side colors), rendered as soft clay.
 *
 * Positioned/rotated imperatively by RubikCube via the forwarded group ref.
 */
export const Cubelet = forwardRef<THREE.Group, CubeletProps>(function Cubelet(
  { stickerFaces, palette, onPointerDown },
  ref
) {
  return (
    <group ref={ref}>
      {/* Body — pointer-down on it starts a layer-turn gesture */}
      <RoundedBox
        args={[0.95, 0.95, 0.95]}
        radius={0.14}
        smoothness={5}
        castShadow
        receiveShadow
        onPointerDown={onPointerDown}
      >
        {/* Semi-translucent glass body — milky, lets light through but not clear */}
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.6}
          roughness={0.22}
          thickness={0.8}
          ior={1.5}
          metalness={0}
          envMapIntensity={0.9}
        />
      </RoundedBox>

      {/* Vivid stickers, slightly proud of the body */}
      {stickerFaces.map((face) => (
        <RoundedBox
          key={face}
          args={[0.86, 0.86, 0.22]}
          radius={0.11}
          smoothness={6}
          position={STICKER_TRANSFORMS[face].position}
          rotation={STICKER_TRANSFORMS[face].rotation}
          castShadow
          receiveShadow
        >
          {/* Matte marshmallow — velvety diffuse, no specular shine at all */}
          <meshStandardMaterial
            color={palette.faces[face].color}
            roughness={0.72}
            metalness={0}
            envMapIntensity={0.25}
          />
        </RoundedBox>
      ))}
    </group>
  );
});
