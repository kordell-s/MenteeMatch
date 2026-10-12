import type { ReactNode } from "react";
import Wordmark from "@/components/world/Wordmark";
import Hold from "@/components/world/Hold";

/** Auth screens: the wall on one side, a laminated card with the form on the other. */
export default function AuthShell({
  title,
  lede,
  wallLine,
  children,
  footer,
}: {
  title: string;
  lede?: ReactNode;
  wallLine: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
      <aside className="wall relative flex flex-col justify-between overflow-hidden px-5 py-5 sm:px-10 lg:min-h-[100dvh] lg:py-10">
        <Wordmark tone="chalk" />
        <div className="relative hidden lg:block">
          <div aria-hidden="true" className="relative mb-10 h-56">
            <Hold color="green" shape={1} size={70} rotate={-14} className="absolute bottom-0 left-4" />
            <Hold color="yellow" shape={0} size={62} rotate={20} className="absolute bottom-16 left-40" />
            <Hold color="blue" shape={3} size={66} rotate={-30} className="absolute bottom-32 left-16" />
            <Hold color="pink" shape={2} size={58} rotate={8} className="absolute bottom-44 left-56" />
          </div>
          <p className="text-display max-w-[13ch] text-[clamp(2.4rem,3.6vw,3.4rem)]">{wallLine}</p>
        </div>
        <p className="hidden text-sm text-chalk/55 lg:block">Mentorship with a route, in any field.</p>
      </aside>

      <main className="panel flex items-start justify-center px-4 py-10 sm:px-8 lg:items-center lg:py-16">
        <div className="w-full max-w-[460px]">
          <h1 className="text-display text-[clamp(2rem,4vw,2.6rem)]">{title}</h1>
          {lede && <p className="mt-2 text-[17px] text-ink-soft">{lede}</p>}
          <div className="route-card mt-8 p-6 sm:p-8">{children}</div>
          {footer && <div className="mt-6 text-center text-[15px] text-ink-soft">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-sm text-ink-soft">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
