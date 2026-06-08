import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Scene } from "./Scene";
import { Controls } from "./Controls";
import { PALETTES } from "./materials";

export default function App() {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);

  const palette = PALETTES[paletteIndex];

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [6.5, 6, 8.5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Scene palette={palette} resetSignal={resetSignal} />
      </Canvas>

      <Controls
        palette={palette}
        onCyclePalette={() => setPaletteIndex((i) => (i + 1) % PALETTES.length)}
        onReset={() => setResetSignal((n) => n + 1)}
      />
    </>
  );
}
