import { Environment, ContactShadows } from "@react-three/drei";
import { RubikCube } from "./rubik/RubikCube";
import type { Palette } from "./materials";

type SceneProps = {
  palette: Palette;
  resetSignal: number;
};

export function Scene({ palette, resetSignal }: SceneProps) {
  return (
    <>
      {/* Even lighting so every face of the cube stays readable */}
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[5, 7, 6]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 3, -4]} intensity={0.7} />
      <Environment preset="studio" environmentIntensity={0.5} />

      <RubikCube palette={palette} resetSignal={resetSignal} />

      <ContactShadows
        position={[0, -2.1, 0]}
        opacity={0.3}
        scale={9}
        blur={2.8}
        far={4}
        color="#5a4a6a"
      />
    </>
  );
}
