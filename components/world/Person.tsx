/* eslint-disable @next/next/no-img-element */
import type { TapeColor } from "./Hold";

const TONES: TapeColor[] = ["yellow", "blue", "pink", "green"];
const BG: Record<TapeColor, string> = {
  yellow: "bg-tape-yellow text-ink",
  blue: "bg-tape-blue text-white",
  pink: "bg-tape-pink text-ink",
  green: "bg-tape-green text-ink",
};

export function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function toneFor(seed?: string | null): TapeColor {
  let h = 0;
  for (const c of seed ?? "") h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

const SIZES = {
  xs: "size-7 text-[11px]",
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl",
};

/** A person's face, or their initials on their own tape colour. */
export default function Person({
  name,
  src,
  size = "md",
  className = "",
}: {
  name?: string | null;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const usable = src && src !== "/placeholder.svg";
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-bold tracking-tight ${SIZES[size]} ${usable ? "bg-gray-200" : BG[toneFor(name)]} ${className}`}
    >
      {usable ? (
        <img src={src!} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
      <span className="sr-only">{name ?? "User"}</span>
    </span>
  );
}

const HONORIFICS = /^(dr|mr|mrs|ms|mx|prof|capt|captain)\.?$/i;
/** A person's first name, skipping honorifics ("Dr. Sarah Chen" gives "Sarah"). */
export function firstName(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/);
  return parts.find((p) => !HONORIFICS.test(p)) ?? parts[0] ?? "";
}
