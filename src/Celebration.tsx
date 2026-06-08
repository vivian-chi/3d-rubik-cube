type CelebrationProps = {
  show: boolean;
  onTryAgain: () => void;
};

const wrap: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "16%",
  transform: "translateX(-50%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 14,
  padding: "22px 30px",
  borderRadius: 24,
  background: "rgba(255, 255, 255, 0.6)",
  backdropFilter: "blur(16px)",
  boxShadow: "0 16px 50px rgba(80, 60, 120, 0.25)",
  userSelect: "none",
  pointerEvents: "auto",
  animation: "celebrate-pop 0.55s cubic-bezier(0.18, 1.4, 0.4, 1) both",
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 30,
  fontWeight: 800,
  letterSpacing: "-0.01em",
  background: "linear-gradient(95deg, #ff8a1f, #ff4d22 55%, #ff2e3a)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const subtitle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "#6b6280",
};

const tryButton: React.CSSProperties = {
  border: "none",
  cursor: "pointer",
  marginTop: 4,
  padding: "11px 26px",
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 700,
  color: "#fff",
  background: "linear-gradient(95deg, #ff7a1f, #ff3322)",
  boxShadow: "0 6px 18px rgba(255, 60, 40, 0.42)",
};

/**
 * Victory message that pops in once the cube is solved. Mounted only while
 * `show` is true so each win re-triggers the entrance animation.
 */
export function Celebration({ show, onTryAgain }: CelebrationProps) {
  if (!show) return null;
  return (
    <>
      <style>{`
        @keyframes celebrate-pop {
          0%   { opacity: 0; transform: translateX(-50%) translateY(14px) scale(0.85); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
      <div style={wrap}>
        <h2 style={title}>Good job! 🎉</h2>
        <p style={subtitle}>Wanna try again?</p>
        <button style={tryButton} onClick={onTryAgain}>
          Try again
        </button>
      </div>
    </>
  );
}
