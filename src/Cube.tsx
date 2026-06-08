import { useMemo, useLayoutEffect, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useSpinControls } from "./useSpinControls";
import { makeNoiseTexture, type Palette, type MaterialMode } from "./materials";

type CubeProps = {
  palette: Palette;
  mode: MaterialMode;
};

/**
 * Writes per-face vertex colors onto a (smoothed) rounded-box geometry. Flat
 * faces get their pure color; the rounded edges/corners blend between the
 * adjacent faces — which reads as a soft, gummy gradient.
 *
 * Face order: [ +x, -x, +y, -y, +z, -z ].
 */
function applyFaceColors(geometry: THREE.BufferGeometry, palette: Palette) {
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

export function Cube({ palette, mode }: CubeProps) {
  const spin = useSpinControls();
  const meshRef = useRef<THREE.Mesh>(null!);
  const noise = useMemo(() => makeNoiseTexture(), []);

  // Recompute vertex colors whenever the palette changes.
  useLayoutEffect(() => {
    if (meshRef.current) applyFaceColors(meshRef.current.geometry, palette);
  }, [palette]);

  return (
    <group ref={spin.ref}>
      <RoundedBox
        ref={meshRef}
        args={[2, 2, 2]}
        radius={0.42}
        smoothness={8}
        castShadow
        onPointerDown={(e) => {
          (e as unknown as { stopPropagation: () => void }).stopPropagation();
          spin.onPointerDown(e as unknown as { clientX: number; clientY: number });
        }}
      >
        {mode === "velvet" ? (
          <meshPhysicalMaterial
            vertexColors
            roughness={0.85}
            metalness={0}
            sheen={1}
            sheenRoughness={0.55}
            sheenColor={"#ffffff"}
            clearcoat={0}
            bumpMap={noise}
            bumpScale={0.025}
          />
        ) : (
          <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
        )}
      </RoundedBox>
    </group>
  );
}
