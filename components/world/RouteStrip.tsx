import Hold from "./Hold";

export type StripMilestone = { id: string; title: string; status: string };


/**
 * A route seen side-on: one hold per milestone. Reached holds carry a chalk tick,
 * the current hold is full colour, and holds ahead are drawn as ghosts.
 */
export default function RouteStrip({
  milestones,
  size = 34,
  tone = "panel",
  showLabels = false,
}: {
  milestones: StripMilestone[];
  size?: number;
  tone?: "panel" | "wall";
  showLabels?: boolean;
}) {
  const currentIdx = milestones.findIndex((m) => m.status !== "COMPLETED");
  const done = milestones.filter((m) => m.status === "COMPLETED").length;
  return (
    <div>
      <ol className="flex items-center" aria-label={`${done} of ${milestones.length} milestones reached`}>
        {milestones.map((m, i) => {
          const reached = m.status === "COMPLETED";
          const current = i === currentIdx;
          return (
            <li key={m.id} className="flex min-w-0 flex-1 items-center last:flex-none">
              <span className="relative" title={m.title}>
                <Hold
                  color="yellow"
                  shape={i}
                  size={current ? size * 1.25 : size}
                  rotate={(i * 37) % 60 - 30}
                  ticked={reached}
                  className={reached || current ? "" : tone === "wall" ? "opacity-45 grayscale brightness-[2.2]" : "opacity-30 grayscale"}
                />
                <span className="sr-only">
                  {m.title}: {reached ? "reached" : current ? "current" : "ahead"}
                </span>
              </span>
              {i < milestones.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mx-1 h-0 flex-1 border-t-2 ${
                    i < currentIdx || currentIdx === -1
                      ? tone === "wall" ? "border-chalk/60" : "border-ink/40"
                      : tone === "wall" ? "border-dashed border-chalk/20" : "border-dashed border-ink/15"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
      {showLabels && currentIdx >= 0 && (
        <p className={`mt-3 text-sm ${tone === "wall" ? "text-chalk/70" : "text-ink-soft"}`}>
          Hold {currentIdx + 1} of {milestones.length}
        </p>
      )}
    </div>
  );
}
