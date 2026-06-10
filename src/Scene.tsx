import { Environment, ContactShadows } from "@react-three/drei";
import { RubikCube } from "./rubik/RubikCube";
import type { Palette } from "./materials";

type SceneProps = {
  palette: Palette;
  resetSignal: number;
  scrambleSignal: number;
  onSolved: () => void;
};

export function Scene({ palette, resetSignal, scrambleSignal, onSolved }: SceneProps) {
  return (
    <>
      {/* Lower fill + stronger warm key = deeper, rosy-tinted form shadows */}
      <hemisphereLight color="#fff6ec" groundColor="#efaec5" intensity={0.55} />
      <directionalLight
        color="#fff3e4"
        position={[5, 7, 6]}
        intensity={1.45}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />
      <directionalLight color="#dfe2ff" position={[-6, 2, 5]} intensity={0.4} />
      <Environment preset="studio" environmentIntensity={0.55} />

      <RubikCube
        palette={palette}
        resetSignal={resetSignal}
        scrambleSignal={scrambleSignal}
        onSolved={onSolved}
      />

      <ContactShadows
        position={[0, -2.05, 0]}
        opacity={0.72}
        scale={7.5}
        blur={2.5}
        far={4.5}
        color="#7c4263"
      />
    </>
  );
}
