import Link from "next/link";
import Hold from "./Hold";

export default function Wordmark({
  href = "/",
  tone = "ink",
  size = "md",
}: {
  href?: string;
  tone?: "ink" | "chalk";
  size?: "sm" | "md";
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 ${tone === "chalk" ? "text-chalk" : "text-ink"}`}
      aria-label="MentorMatch home"
    >
      <Hold
        color="yellow"
        shape={1}
        size={size === "sm" ? 26 : 32}
        className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-12"
      />
      <span
        className={`font-display font-extrabold tracking-[-0.03em] ${size === "sm" ? "text-lg" : "text-[22px]"}`}
        style={{ fontStretch: "115%" }}
      >
        MentorMatch
      </span>
    </Link>
  );
}
