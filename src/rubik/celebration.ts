import gsap from "gsap";
import * as THREE from "three";
import type { CubeletData } from "./types";

type CelebrationOpts = {
  group: THREE.Group;
  cubelets: CubeletData[];
  /** Fired partway through (reassembly) so the message shows "in the meanwhile". */
  onMessage: () => void;
  /** Fired when the whole sequence finishes. */
  onComplete: () => void;
};

const jit = (amt: number) => (Math.random() - 0.5) * amt;

/** Where a cubelet flies when the cube explodes: far out radially + some jitter. */
function explodeTarget(c: CubeletData): THREE.Vector3 {
  const target = c.position.clone().multiplyScalar(4.4);
  target.set(target.x + jit(1.5), target.y + jit(1.5), target.z + jit(1.5));
  // The center cubelet has no outward direction — fling it somewhere random.
  if (target.lengthSq() < 1) target.set(jit(8), jit(8), jit(8));
  return target;
}

/**
 * Builds the victory choreography as a GSAP timeline and returns it (already
 * playing). The caller owns it and should `.kill()` it on reset/unmount.
 *
 * Phases: excited jump → 3s spin (slow→fast) → explode (fast→slow) → hold →
 * reassemble (message fades in) → final bounces.
 */
export function buildCelebration({
  group,
  cubelets,
  onMessage,
  onComplete,
}: CelebrationOpts): gsap.core.Timeline {
  const baseRotY = group.rotation.y;

  // Snapshot the solved transform so reassembly lands exactly where we started.
  const homes = cubelets.map((c) => ({
    cubelet: c,
    pos: c.position.clone(),
    rot: c.obj ? c.obj.rotation.clone() : new THREE.Euler(),
    target: explodeTarget(c),
  }));

  const tl = gsap.timeline({ onComplete });

  // Phase 1 — one excited hop with a squash/stretch.
  tl.to(group.position, { y: 0.6, duration: 0.18, ease: "power2.out" })
    .to(group.scale, { x: 1.1, y: 0.88, z: 1.1, duration: 0.18, ease: "power2.out" }, "<")
    .to(group.position, { y: 0, duration: 0.24, ease: "bounce.out" })
    .to(group.scale, { x: 1, y: 1, z: 1, duration: 0.24, ease: "power2.out" }, "<");

  // Phase 2 — spin up, slow → fast, for 3 seconds.
  tl.to(group.rotation, { y: baseRotY + Math.PI * 6, duration: 3, ease: "power3.in" });

  // Phase 3 — explode outward, fast → slow, all at once.
  tl.addLabel("explode");
  for (const h of homes) {
    if (!h.cubelet.obj) continue;
    tl.to(
      h.cubelet.obj.position,
      { x: h.target.x, y: h.target.y, z: h.target.z, duration: 0.85, ease: "power3.out" },
      "explode"
    );
    tl.to(
      h.cubelet.obj.rotation,
      {
        x: h.rot.x + jit(4),
        y: h.rot.y + jit(4),
        z: h.rot.z + jit(4),
        duration: 0.85,
        ease: "power2.out",
      },
      "explode"
    );
  }

  // Phase 4 — hold at full extent with a gentle drift (~1.5s).
  tl.to(group.position, {
    y: 0.3,
    duration: 0.75,
    ease: "sine.inOut",
    yoyo: true,
    repeat: 1,
  });

  // Phase 5 — reassemble into the cube; message appears here.
  tl.addLabel("reassemble");
  tl.add(onMessage, "reassemble");
  tl.to(group.rotation, { y: baseRotY, duration: 1, ease: "power2.inOut" }, "reassemble");
  for (const h of homes) {
    if (!h.cubelet.obj) continue;
    tl.to(
      h.cubelet.obj.position,
      { x: h.pos.x, y: h.pos.y, z: h.pos.z, duration: 1, ease: "back.out(1.4)" },
      "reassemble"
    );
    tl.to(
      h.cubelet.obj.rotation,
      { x: h.rot.x, y: h.rot.y, z: h.rot.z, duration: 1, ease: "back.out(1.4)" },
      "reassemble"
    );
  }

  // Phase 6 — two victory bounces.
  tl.to(group.position, { y: 0.5, duration: 0.2, ease: "power2.out" })
    .to(group.position, { y: 0, duration: 0.3, ease: "bounce.out" })
    .to(group.position, { y: 0.32, duration: 0.18, ease: "power2.out" })
    .to(group.position, { y: 0, duration: 0.26, ease: "bounce.out" });

  return tl;
}
