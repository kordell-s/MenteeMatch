"use client";

import { ArrowRight } from "lucide-react";
import Hold from "@/components/world/Hold";
import { ORG } from "../fixture";
import { useDemo } from "../state";

export default function TitleCard() {
  const { dispatch } = useDemo();
  return (
    <section className="wall wall-panels grid min-h-[calc(100dvh-4rem)] place-items-center px-8">
      <div className="grid w-full max-w-[1240px] items-center gap-12 lg:grid-cols-[1.8fr_1fr]">
        <div>
          <h1 className="text-display text-[clamp(2.8rem,5vw,4.6rem)] text-chalk">
            Internal mobility, mapped and climbed.
          </h1>
          <p className="mt-6 text-xl text-chalk/80">Prepared for {ORG.name}</p>
          <p className="mt-2 text-[15px] text-chalk/60">A demo workspace, {ORG.staff}.</p>
          <button
            type="button"
            onClick={() => dispatch({ type: "start" })}
            className="mt-10 inline-flex h-13 items-center gap-2 rounded-[10px] bg-tape-yellow px-7 text-base font-bold text-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.14)] hover:bg-[#ffdb63]"
          >
            Open the wall <ArrowRight className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div aria-hidden="true" className="relative hidden h-80 lg:block">
          <Hold color="yellow" shape={1} size={84} rotate={-14} ticked className="absolute bottom-0 left-6" />
          <Hold color="yellow" shape={3} size={76} rotate={20} ticked className="absolute bottom-24 left-40" />
          <Hold color="yellow" shape={0} size={80} rotate={-30} className="absolute bottom-48 left-12" />
          <span className="tape absolute right-0 top-0 -rotate-3 text-2xl" data-tape="yellow">Top · Ready for the role</span>
        </div>
      </div>
    </section>
  );
}
