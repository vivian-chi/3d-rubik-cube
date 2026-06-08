import { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Drag-to-rotate with throwable inertia + a gentle idle auto-spin.
 *
 * - Attach `ref` to the <group> you want to rotate.
 * - Attach `onPointerDown` to the mesh so dragging only starts on the cube.
 *
 * While dragging, rotation follows the pointer and we record angular velocity.
 * On release, that velocity carries the spin and decays (the "throw"). After a
 * short rest, a slow constant spin blends back in.
 */
export function useSpinControls() {
  const ref = useRef<THREE.Group>(null!);
  const velocity = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const idleTime = useRef(0);

  const onPointerDown = useCallback((e: { clientX: number; clientY: number }) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    idleTime.current = 0;
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };

      const k = 0.006;
      velocity.current.y = dx * k; // horizontal drag -> spin around Y
      velocity.current.x = dy * k; // vertical drag -> spin around X

      const g = ref.current;
      if (g) {
        g.rotation.y += velocity.current.y;
        g.rotation.x += velocity.current.x;
      }
    };
    const onUp = () => {
      dragging.current = false;
      idleTime.current = 0;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g || dragging.current) return;

    // Inertia: keep spinning, decaying frame-rate-independently.
    g.rotation.y += velocity.current.y;
    g.rotation.x += velocity.current.x;
    const damp = Math.pow(0.94, delta * 60);
    velocity.current.x *= damp;
    velocity.current.y *= damp;

    // Idle auto-spin blends in ~0.6s after release, scaled up to full over ~1.5s.
    idleTime.current += delta;
    const idle = THREE.MathUtils.clamp((idleTime.current - 0.6) / 1.5, 0, 1);
    g.rotation.y += 0.0035 * idle;
    g.rotation.x += 0.0009 * idle;
  });

  return { ref, onPointerDown };
}
