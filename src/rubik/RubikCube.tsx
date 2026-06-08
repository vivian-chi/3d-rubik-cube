import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Cubelet } from "./Cubelet";
import { AXES, SPACING, snapToAxis, roundGrid, easeInOut, type AxisName } from "./math";
import type { Palette } from "../materials";

type CubeletData = {
  id: number;
  /** Solved-state grid coords — used to restore on reset. */
  home: { x: number; y: number; z: number };
  /** Logical grid coords in {-1,0,1}. */
  grid: { x: number; y: number; z: number };
  /** Committed (settled) local transform. */
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  obj: THREE.Group | null;
};

type Turn = {
  axis: AxisName;
  layer: number; // which slice: -1, 0, or 1
  dir: number; // +1 / -1 (rotation direction about the positive axis)
  t: number; // 0..1 animation progress
};

const TURN_DURATION = 0.22; // seconds per 90° turn

/** Which outward faces a cubelet shows, from its solved-state coords. */
function stickerFacesFor(home: { x: number; y: number; z: number }): number[] {
  const faces: number[] = [];
  if (home.x === 1) faces.push(0);
  if (home.x === -1) faces.push(1);
  if (home.y === 1) faces.push(2);
  if (home.y === -1) faces.push(3);
  if (home.z === 1) faces.push(4);
  if (home.z === -1) faces.push(5);
  return faces;
}

function buildCubelets(): CubeletData[] {
  const cubelets: CubeletData[] = [];
  let id = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubelets.push({
          id: id++,
          home: { x, y, z },
          grid: { x, y, z },
          position: new THREE.Vector3(x * SPACING, y * SPACING, z * SPACING),
          quaternion: new THREE.Quaternion(),
          obj: null,
        });
      }
    }
  }
  return cubelets;
}

type RubikCubeProps = {
  palette: Palette;
  resetSignal: number;
};

export function RubikCube({ palette, resetSignal }: RubikCubeProps) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null!);
  const cubelets = useMemo(buildCubelets, []);

  // Mutable interaction state (kept in refs so it never triggers re-renders).
  const turn = useRef<Turn | null>(null);
  const mode = useRef<"none" | "gesture" | "orbit">("none");
  const cubeletHit = useRef(false);
  const gesture = useRef<{
    cubelet: CubeletData;
    faceNormal: THREE.Vector3; // group-local, axis-aligned
    startX: number;
    startY: number;
    triggered: boolean;
  } | null>(null);
  const orbit = useRef({ x: 0, y: 0 });

  // Reset to solved whenever the parent bumps resetSignal.
  useEffect(() => {
    turn.current = null;
    mode.current = "none";
    gesture.current = null;
    // Restore exact solved state from each cubelet's fixed home coords.
    for (const c of cubelets) {
      c.grid = { ...c.home };
      c.position.set(c.home.x * SPACING, c.home.y * SPACING, c.home.z * SPACING);
      c.quaternion.identity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  // --- Gesture: pointer down on a cubelet -------------------------------------
  const startGesture = (cubelet: CubeletData) => (e: ThreeEvent<PointerEvent>) => {
    if (turn.current) return;
    e.stopPropagation();
    const face = e.face;
    if (!face) return;

    // World face normal -> group-local, snapped to a grid axis.
    const worldNormal = face.normal
      .clone()
      .transformDirection(e.eventObject.matrixWorld);
    const localNormal = worldNormal
      .clone()
      .applyQuaternion(groupRef.current.quaternion.clone().invert());
    const snapped = snapToAxis(localNormal);

    cubeletHit.current = true;
    mode.current = "gesture";
    gesture.current = {
      cubelet,
      faceNormal: AXES[snapped.axis].clone().multiplyScalar(snapped.sign),
      startX: e.clientX,
      startY: e.clientY,
      triggered: false,
    };
  };

  // Translate a drag gesture into a concrete layer turn.
  const resolveTurn = (clientX: number, clientY: number) => {
    const g = gesture.current;
    if (!g || g.triggered || turn.current) return;

    const dx = clientX - g.startX;
    const dy = clientY - g.startY;
    if (Math.hypot(dx, dy) < 10) return; // below threshold — still a tap

    // Drag direction in world space, from the camera's screen axes.
    const camRight = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const camUp = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const dragWorld = camRight.multiplyScalar(dx).add(camUp.multiplyScalar(-dy));
    const dragLocal = dragWorld.applyQuaternion(
      groupRef.current.quaternion.clone().invert()
    );

    // Rotation axis = face normal × drag (component along normal cancels out).
    const rotAxis = new THREE.Vector3().crossVectors(g.faceNormal, dragLocal);
    const { axis, sign } = snapToAxis(rotAxis);

    g.triggered = true;
    turn.current = {
      axis,
      layer: g.cubelet.grid[axis],
      dir: sign,
      t: 0,
    };
  };

  useEffect(() => {
    // Fires after any cubelet's R3F handler (target phase) has run, so we can
    // tell "started on a cubelet" (gesture) from "started on empty space" (orbit).
    const onDown = (e: PointerEvent) => {
      if (cubeletHit.current) {
        cubeletHit.current = false; // consumed by startGesture
        return;
      }
      if (turn.current) return;
      mode.current = "orbit";
      orbit.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (mode.current === "orbit") {
        const dx = e.clientX - orbit.current.x;
        const dy = e.clientY - orbit.current.y;
        orbit.current = { x: e.clientX, y: e.clientY };
        const grp = groupRef.current;
        grp.rotateOnWorldAxis(AXES.y, dx * 0.008);
        grp.rotateOnWorldAxis(AXES.x, dy * 0.008);
      } else if (mode.current === "gesture") {
        resolveTurn(e.clientX, e.clientY);
      }
    };
    const onUp = () => {
      mode.current = "none";
      gesture.current = null;
      cubeletHit.current = false;
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bake an in-progress turn back into committed transforms once it finishes.
  const commitTurn = (t: Turn) => {
    const q = new THREE.Quaternion().setFromAxisAngle(AXES[t.axis], (t.dir * Math.PI) / 2);
    for (const c of cubelets) {
      if (c.grid[t.axis] !== t.layer) continue;
      c.position.applyQuaternion(q);
      c.position.set(
        roundGrid(c.position.x) * SPACING,
        roundGrid(c.position.y) * SPACING,
        roundGrid(c.position.z) * SPACING
      );
      c.quaternion.premultiply(q).normalize();
      c.grid = {
        x: roundGrid(c.position.x),
        y: roundGrid(c.position.y),
        z: roundGrid(c.position.z),
      };
    }
  };

  useFrame((_, delta) => {
    const t = turn.current;
    const tmpQ = new THREE.Quaternion();

    if (t) {
      t.t = Math.min(1, t.t + delta / TURN_DURATION);
      const angle = t.dir * (Math.PI / 2) * easeInOut(t.t);
      tmpQ.setFromAxisAngle(AXES[t.axis], angle);
    }

    for (const c of cubelets) {
      if (!c.obj) continue;
      if (t && c.grid[t.axis] === t.layer) {
        c.obj.position.copy(c.position).applyQuaternion(tmpQ);
        c.obj.quaternion.copy(tmpQ).multiply(c.quaternion);
      } else {
        c.obj.position.copy(c.position);
        c.obj.quaternion.copy(c.quaternion);
      }
    }

    if (t && t.t >= 1) {
      commitTurn(t);
      turn.current = null;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.45, -0.6, 0]}>
      {cubelets.map((c) => (
        <Cubelet
          key={c.id}
          ref={(o) => {
            c.obj = o;
          }}
          stickerFaces={stickerFacesFor(c.home)}
          palette={palette}
          onPointerDown={startGesture(c)}
        />
      ))}
    </group>
  );
}
