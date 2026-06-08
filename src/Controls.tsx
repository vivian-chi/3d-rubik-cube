import type { Palette } from "./materials";

type ControlsProps = {
  palette: Palette;
  onCyclePalette: () => void;
  onReset: () => void;
};

const panel: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: 28,
  transform: "translateX(-50%)",
  display: "flex",
  gap: 10,
  padding: 8,
  borderRadius: 999,
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 30px rgba(80, 60, 120, 0.18)",
  userSelect: "none",
};

const button: React.CSSProperties = {
  border: "none",
  cursor: "pointer",
  padding: "10px 18px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  color: "#3a3050",
  background: "rgba(255, 255, 255, 0.85)",
  boxShadow: "0 2px 8px rgba(80, 60, 120, 0.12)",
};

const hint: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: 24,
  transform: "translateX(-50%)",
  fontSize: 13,
  color: "#6b6280",
  background: "rgba(255,255,255,0.5)",
  padding: "6px 14px",
  borderRadius: 999,
  userSelect: "none",
};

export function Controls({ palette, onCyclePalette, onReset }: ControlsProps) {
  return (
    <>
      <div style={hint}>Drag a face to turn it · drag the background to orbit</div>
      <div style={panel}>
        <button style={button} onClick={onReset}>
          ↺ Reset
        </button>
        <button style={button} onClick={onCyclePalette}>
          🎨 {palette.name}
        </button>
      </div>
    </>
  );
}
