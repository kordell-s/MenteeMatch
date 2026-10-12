import Link from "next/link";
import type { ReactNode } from "react";

/** Page title row used by every app screen. */
export function PageTitle({
  title,
  lede,
  actions,
}: {
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-display text-[clamp(2rem,4vw,2.9rem)] text-ink">{title}</h1>
        {lede && <p className="mt-2 max-w-[60ch] text-[17px] text-ink-soft">{lede}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** A titled block on a route card. */
export function Panel({
  title,
  action,
  children,
  className = "",
  as: As = "section",
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "aside";
}) {
  return (
    <As className={`route-card min-w-0 p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </As>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[12px] border-2 border-dashed border-ink/12 px-5 py-8 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-[42ch] text-[15px] text-ink-soft">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink">
      {children}
    </Link>
  );
}

/** Skeleton block matching card shapes while data loads. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[12px] bg-ink/6 ${className}`} aria-hidden="true" />;
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-tape-red-soft px-4 py-3 text-[15px] text-red-800">
      <span>{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2">
          Try again
        </button>
      )}
    </div>
  );
}

export function formatWhen(dateIso: string, time?: string | null) {
  const d = new Date(dateIso);
  const day = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  return time ? `${day}, ${time}` : day;
}

export function dueLabel(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const days = Math.round((d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
  if (days < 0) return { text: `${-days}d overdue`, tone: "late" as const };
  if (days === 0) return { text: "Due today", tone: "soon" as const };
  if (days === 1) return { text: "Due tomorrow", tone: "soon" as const };
  if (days <= 7) return { text: `Due in ${days} days`, tone: "soon" as const };
  return { text: new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }), tone: "later" as const };
}
