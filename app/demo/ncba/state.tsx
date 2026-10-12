"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import { demoReducer, initialState, type Action, type DemoState } from "./reducer";

const Ctx = createContext<{ state: DemoState; dispatch: Dispatch<Action> } | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, initialState);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDemo must be used inside DemoProvider");
  return v;
}
