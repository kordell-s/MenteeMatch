import { useId } from "react";

/**
 * A resin climbing hold, bolted to the wall. Holds are the product's unit of
 * progress: one milestone on a mentor-set route.
 */
export type TapeColor = "yellow" | "blue" | "pink" | "green";

const RESIN: Record<TapeColor, { light: string; base: string; dark: string }> = {
  yellow: { light: "#ffe78a", base: "#ffd23f", dark: "#c99a00" },
  blue: { light: "#7fa3ff", base: "#2f64e6", dark: "#1a3d9c" },
  pink: { light: "#ffa3c9", base: "#ff5fa2", dark: "#c22d6c" },
  green: { light: "#7fe0ad", base: "#2fb872", dark: "#16784a" },
};

// Five organic hold silhouettes (crimp, jug, sloper, pinch, pocket), drawn in a 100x100 box.
const SHAPES = [
  "M18 52c-6-14 4-30 22-34 12-3 22 2 32 0 14-3 24 8 22 22-1 10-8 14-9 24-2 14-14 22-30 20-12-2-18-8-28-10-10-2-6-12-9-22z",
  "M14 46c2-18 20-30 40-30 22 0 36 14 34 32-1 12-10 16-14 26-6 12-22 14-36 10-16-4-26-20-24-38z",
  "M10 60c0-20 18-40 42-42 20-2 38 12 38 30 0 16-12 22-24 28-14 6-32 10-44 2-8-5-12-10-12-18z",
  "M22 30c10-12 34-16 48-6 12 8 18 22 12 36-4 10-2 20-12 26-12 8-28 4-38-6-10-10-20-14-18-28 1-10 2-16 8-22z",
  "M16 50c-2-16 12-32 30-34 10-1 16 4 26 4 12 0 18 10 16 22-2 14-4 22-16 30-14 9-34 8-46-2-6-6-9-12-10-20z",
];

export default function Hold({
  color = "yellow",
  shape = 0,
  size = 56,
  rotate = 0,
  className = "",
  ticked = false,
}: {
  color?: TapeColor;
  shape?: number;
  size?: number;
  rotate?: number;
  className?: string;
  /** A chalk tick: this hold has been reached. */
  ticked?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const r = RESIN[color];
  const d = SHAPES[((shape % SHAPES.length) + SHAPES.length) % SHAPES.length];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`g${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={r.light} />
          <stop offset="55%" stopColor={r.base} />
          <stop offset="100%" stopColor={r.dark} />
        </radialGradient>
        <filter id={`c${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="4.5" />
        </filter>
        <filter id={`s${id}`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>
      <path d={d} fill={`url(#g${id})`} filter={`url(#s${id})`} />
      <circle cx="50" cy="50" r="7" fill={r.dark} />
      <circle cx="50" cy="50" r="4" fill="#15171a" />
      {ticked && (
        // A chalk tick, kept upright whatever the hold's rotation.
        <g transform={`rotate(${-rotate} 50 50)`} fill="none" stroke="#eef0ec" strokeLinecap="round" strokeLinejoin="round" filter={`url(#c${id})`}>
          <path d="M28 50 Q34 55 41 66 Q52 45 75 27" strokeWidth="7.5" opacity="0.85" strokeDasharray="34 3 40" />
          <path d="M31 53 Q37 58 41 62 Q50 47 66 34" strokeWidth="2.5" opacity="0.45" />
        </g>
      )}
    </svg>
  );
}
