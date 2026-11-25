import Hold, { type TapeColor } from "@/components/world/Hold";

type Stop = {
  x: number; // % from left
  y: number; // % from top
  color: TapeColor;
  shape: number;
  rotate: number;
  label: string;
  grade: string;
  side: "left" | "right";
};

// An example route, bottom (start) to top (finish).
export const ROUTE: Stop[] = [
  { x: 30, y: 88, color: "yellow", shape: 1, rotate: -12, label: "Map your goal", grade: "Start", side: "right" },
  { x: 50, y: 73, color: "yellow", shape: 0, rotate: 18, label: "Learn the fundamentals", grade: "V1", side: "right" },
  { x: 34, y: 58, color: "yellow", shape: 3, rotate: -24, label: "First real project", grade: "V2", side: "right" },
  { x: 66, y: 43, color: "yellow", shape: 2, rotate: 8, label: "Résumé & portfolio", grade: "V3", side: "left" },
  { x: 42, y: 28, color: "yellow", shape: 4, rotate: -6, label: "Mock interviews", grade: "V4", side: "right" },
];

export default function RouteWall() {
  const points = ROUTE.map((s) => `${s.x},${s.y}`).join(" ") + " 72,9";
  return (
    <figure className="relative h-full min-h-[520px] w-full" aria-labelledby="route-caption">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
        aria-hidden="true"
      >
        <polyline
          points={points}
          fill="none"
          stroke="rgb(244 245 242 / 0.35)"
          strokeWidth="0.5"
          strokeDasharray="1.4 1.6"
          vectorEffect="non-scaling-stroke"
          className="route-line"
          style={{ strokeWidth: 2 }}
        />
      </svg>

      <ol className="absolute inset-0">
        {ROUTE.map((s, i) => (
          <li
            key={s.label}
            className="route-stop absolute flex items-center gap-3"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              // Pin the hold's centre (not the whole row) to the route point.
              transform: s.side === "left" ? "translate(calc(-100% + 42px), -50%)" : "translate(-42px, -50%)",
              flexDirection: s.side === "left" ? "row-reverse" : "row",
              animationDelay: `${180 + i * 140}ms`,
            }}
          >
            <Hold color={s.color} shape={s.shape} rotate={s.rotate} size={84} className="shrink-0" />
            <span
              className="tape whitespace-nowrap text-[15px] sm:text-base"
              data-tape="chalk"
              style={{ transform: `rotate(${i % 2 ? 2 : -2}deg)` }}
            >
              <span className="rounded-[3px] bg-ink px-1.5 py-0.5 font-sans text-xs font-bold not-italic text-tape-yellow">{s.grade}</span>
              {s.label}
            </span>
          </li>
        ))}
        <li
          className="route-stop absolute"
          style={{ left: "72%", top: "9%", transform: "translate(-50%, -50%)", animationDelay: `${180 + ROUTE.length * 140}ms` }}
        >
          <span className="tape -rotate-3 flex-col items-start gap-0 whitespace-nowrap px-4 py-2 text-xl sm:text-2xl" data-tape="yellow">
            Top · First offer
            <span className="text-sm">set by your mentor</span>
          </span>
        </li>
      </ol>

      <figcaption
        id="route-caption"
        className="absolute bottom-0 right-0 text-xs font-medium text-chalk/60"
      >
        An example route a mentor might set
      </figcaption>

      <style>{`
        .route-stop { animation: set-hold 700ms var(--ease-out-expo) backwards; }
        .route-line { stroke-dashoffset: 0; animation: draw-route 1600ms 200ms var(--ease-out-expo) backwards; }
        @keyframes set-hold {
          from { opacity: 0; translate: 0 18px; scale: 0.9; }
        }
        @keyframes draw-route {
          from { opacity: 0; }
        }
      `}</style>
    </figure>
  );
}
