"use client";

import { RotateCcw } from "lucide-react";
import Wordmark from "@/components/world/Wordmark";
import { ORG } from "./fixture";
import { DemoProvider, useDemo } from "./state";
import { SyntheticTag } from "./ui";
import TitleCard from "./views/TitleCard";
import Wall from "./views/Wall";
import Bench from "./views/Bench";
import Climb from "./views/Climb";
import RouteBuilder from "./views/RouteBuilder";
import type { Viewer } from "./types";

const VIEWERS: { id: Viewer; label: string }[] = [
  { id: "admin", label: "L&D admin" },
  { id: "employee", label: "Employee" },
  { id: "mentor", label: "Mentor" },
];

function Bar() {
  const { state, dispatch } = useDemo();
  return (
    <header className="wall sticky top-0 z-40 border-b border-white/8">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 whitespace-nowrap px-6 xl:gap-6">
        <Wordmark tone="chalk" size="sm" href="/demo/ncba" />
        <span className="hidden text-sm text-chalk/70 xl:inline">{ORG.short} workspace</span>
        <span className="text-chalk"><SyntheticTag /></span>
        <div className="ml-auto flex items-center gap-2 xl:gap-4">
          {state.started && (
            <div role="radiogroup" aria-label="Viewing as" className="flex items-center gap-1 rounded-[12px] bg-white/6 p-1">
              <span className="hidden px-2 text-sm text-chalk/60 xl:inline">Viewing as</span>
              {VIEWERS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={state.viewer === v.id}
                  onClick={() => dispatch({ type: "setViewer", viewer: v.id })}
                  className={`h-9 rounded-[9px] px-3 text-sm font-semibold transition-colors ${
                    state.viewer === v.id ? "bg-tape-yellow text-ink" : "text-chalk/80 hover:text-chalk"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => dispatch({ type: "reset" })}
            className="inline-flex h-9 items-center gap-1.5 rounded-[9px] px-3 text-sm font-semibold text-chalk/80 hover:bg-white/6 hover:text-chalk"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Reset demo
          </button>
        </div>
      </div>
    </header>
  );
}

function Body() {
  const { state } = useDemo();
  if (!state.started) return <TitleCard />;
  return (
    <main className="panel min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto max-w-[1440px] px-6 py-10">
        {state.viewer === "admin" && (
          <div className="grid gap-8">
            <Wall />
            <Bench />
          </div>
        )}
        {state.viewer === "employee" && <Climb />}
        {state.viewer === "mentor" && <RouteBuilder />}
      </div>
    </main>
  );
}

export default function Demo() {
  return (
    <DemoProvider>
      <Bar />
      <Body />
    </DemoProvider>
  );
}
