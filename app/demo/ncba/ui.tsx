import { SKILLS } from "./fixture";
import type { CellState, Level, Source } from "./types";

export function sourceLabel(source: Source): string {
  return source === "verified" ? "Mentor-verified" : source === "hr" ? "From HR records" : "Self-declared";
}

export function skillName(id: string): string {
  return SKILLS.find((s) => s.id === id)?.name ?? id;
}

export const HATCH = "repeating-linear-gradient(135deg, rgb(23 25 28 / 0.18) 0 3px, transparent 3px 7px)";

/**
 * One person-by-skill cell. Solid ink = mentor-verified at the level, hatched = self-declared or
 * HR-imported at the level, hatched outline = held below the level, empty = no claim.
 */
export function SkillCell({
  state, have, need, highlight = false, testId,
}: { state: CellState; have: number; need: Level; highlight?: boolean; testId?: string }) {
  const label =
    state === "verified" ? `Verified at level ${have}` :
    state === "unverified" ? `Held at level ${have}, not yet verified` :
    state === "short" ? `Level ${have} of ${need} needed` : `Not held, level ${need} needed`;
  return (
    <span
      data-testid={testId}
      data-state={state}
      title={label}
      aria-label={label}
      className={`tabular inline-grid size-9 place-items-center rounded-[8px] text-xs font-bold transition-shadow ${
        state === "verified" ? "bg-ink text-chalk" :
        state === "unverified" ? "border border-ink/30 text-ink" :
        state === "short" ? "border border-dashed border-ink/40 text-ink-soft" : "border border-ink/10 text-transparent"
      } ${highlight ? "ring-[3px] ring-tape-blue ring-offset-2" : ""}`}
      style={state === "unverified" || state === "short" ? { backgroundImage: HATCH } : undefined}
    >
      {have > 0 ? have : "·"}
    </span>
  );
}

export function LevelTag({ level }: { level: number }) {
  return <span className="tabular rounded-[4px] bg-ink px-1.5 py-0.5 text-xs font-bold text-tape-yellow">L{level}</span>;
}

export function SyntheticTag() {
  return (
    <span className="whitespace-nowrap rounded-full border border-current/30 px-2.5 py-1 text-xs font-semibold">Synthetic demo data</span>
  );
}
