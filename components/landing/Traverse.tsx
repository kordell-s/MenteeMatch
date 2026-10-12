import Hold from "@/components/world/Hold";

const STEPS = [
  { grade: "Start", title: "Match on shared skills", body: "Tell us what you're learning. We rank mentors by how much of it they know.", drop: 0 },
  { grade: "V1", title: "Send a request", body: "Say what you want help with. When your mentor accepts, a private chat opens.", drop: 88 },
  { grade: "V2", title: "Get your route", body: "Your mentor lays out milestones, tasks and resources, in order and graded.", drop: 24 },
  { grade: "Top", title: "Climb it together", body: "Book sessions, check in each week and tick off holds until you top out.", drop: 120 },
];
const HOLD = 64;

/**
 * How it works, as one traverse across the wall: four holds at different
 * heights joined by a rope, each with its own graded tape label.
 */
export default function Traverse() {
  const pts = STEPS.map((s, i) => `${12.5 + i * 25},${s.drop + HOLD / 2}`).join(" ");
  return (
    <div className="relative mt-16">
      {/* Rope, desktop: x in % of width, y in px */}
      <svg
        aria-hidden="true"
        className="absolute inset-x-0 top-0 hidden h-[220px] w-full lg:block"
        viewBox="0 0 100 220"
        preserveAspectRatio="none"
      >
        <polyline points={pts} fill="none" stroke="rgb(244 245 242 / 0.4)" strokeWidth="2.5" strokeDasharray="10 9" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* Rope, mobile: straight down the left */}
      <span aria-hidden="true" className="absolute bottom-10 left-[31px] top-8 border-l-2 border-dashed border-chalk/30 lg:hidden" />

      <ol className="relative grid gap-12 lg:grid-cols-4 lg:gap-6">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative grid grid-cols-[64px_1fr] gap-x-5 lg:block" style={{ ["--drop" as string]: `${s.drop}px` }}>
            <div className="flex justify-center lg:mt-[var(--drop)]">
              <Hold
                color="yellow"
                shape={i + 1}
                size={HOLD}
                rotate={i * 31 - 24}
                ticked={i === 0}
              />
            </div>
            <div className="lg:mt-5 lg:text-center">
              <span className="tape text-[15px]" data-tape={s.grade === "Top" ? "yellow" : "chalk"} style={{ transform: `rotate(${i % 2 ? 2 : -2}deg)` }}>
                <span className="rounded-[3px] bg-ink px-1.5 py-0.5 font-sans text-xs font-bold text-tape-yellow">{s.grade}</span>
                {s.title}
              </span>
              <p className="mt-4 max-w-[32ch] text-[15px] leading-relaxed text-chalk/75 lg:mx-auto">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
