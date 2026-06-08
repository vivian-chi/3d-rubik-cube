import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Scene } from "./Scene";
import { Controls } from "./Controls";
import { Celebration } from "./Celebration";
import { PALETTES } from "./materials";

export default function App() {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [scrambleSignal, setScrambleSignal] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const palette = PALETTES[paletteIndex];

  const scramble = () => {
    setShowCelebration(false);
    setScrambleSignal((n) => n + 1);
  };
  const reset = () => {
    setShowCelebration(false);
    setResetSignal((n) => n + 1);
  };

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
        <Scene
          palette={palette}
          resetSignal={resetSignal}
          scrambleSignal={scrambleSignal}
          onSolved={() => setShowCelebration(true)}
        />
      </Canvas>

      <Controls
        palette={palette}
        onCyclePalette={() => setPaletteIndex((i) => (i + 1) % PALETTES.length)}
        onReset={reset}
        onScramble={scramble}
      />

      <Celebration show={showCelebration} onTryAgain={scramble} />
    </>
  );
}
