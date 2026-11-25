"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/auth/AuthShell";

type Role = "mentee" | "mentor";

// Mirrors the server rules in /api/auth/signup.
const RULES = [
  { id: "len", label: "8 or more characters", test: (p: string) => p.length >= 8 },
  { id: "case", label: "Upper and lower case letters", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: "num", label: "At least one number", test: (p: string) => /[0-9]/.test(p) },
];

export default function SignupForm() {
  const params = useSearchParams();
  const [role, setRole] = useState<Role>(params.get("role") === "mentor" ? "mentor" : "mentee");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Enter your name.";
    if (!email) next.email = "Enter your email address.";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "That doesn't look like an email address.";
    if (!RULES.every((r) => r.test(password))) next.password = "Your password needs everything in the list below.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password, role: role.toUpperCase(), bio: "", title: null, school: null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setErrors({ general: data.error || "We couldn't create your account. Try again." });
        setLoading(false);
        return;
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      const skills = params.get("skills");
      if (result?.ok && !result.error) {
        window.location.href = skills ? `/onboarding?skills=${encodeURIComponent(skills)}` : "/onboarding";
      } else {
        window.location.href = `/login?email=${encodeURIComponent(email)}`;
      }
    } catch {
      setErrors({ general: "We couldn't reach the server. Check your connection and try again." });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      {errors.general && (
        <p role="alert" className="rounded-[10px] bg-tape-red-soft px-3.5 py-3 text-[15px] text-red-800">
          {errors.general}
        </p>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">I want to</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          {([
            { v: "mentee", t: "Find a mentor", d: "Get a route to your first role" },
            { v: "mentor", t: "Mentor someone", d: "Set routes for people starting out" },
          ] as const).map((o) => {
            const on = role === o.v;
            return (
              <label
                key={o.v}
                className={`relative cursor-pointer rounded-[12px] border-2 p-3.5 transition-colors ${
                  on ? "border-ink bg-tape-yellow/25" : "border-ink/12 hover:border-ink/30"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={o.v}
                  checked={on}
                  onChange={() => setRole(o.v)}
                  className="sr-only"
                />
                <span className="block font-bold text-ink">{o.t}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{o.d}</span>
                {on && <Check className="absolute right-3 top-3 size-4" aria-hidden="true" />}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field id="name" label="Full name" error={errors.name}>
        <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
      </Field>

      <Field id="email" label="Email" error={errors.email}>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
      </Field>

      <Field id="password" label="Password" error={errors.password}>
        <div className="relative">
          <Input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby="password-rules"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-ink-soft hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        <ul id="password-rules" className="grid gap-1 text-sm">
          {RULES.map((r) => {
            const ok = r.test(password);
            return (
              <li key={r.id} className={`flex items-center gap-2 ${ok ? "text-green-700" : "text-ink-soft"}`}>
                <span className={`grid size-4 place-items-center rounded-full ${ok ? "bg-tape-green text-ink" : "border border-ink/25"}`}>
                  {ok && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
                </span>
                {r.label}
                <span className="sr-only">{ok ? "(done)" : "(not yet)"}</span>
              </li>
            );
          })}
        </ul>
      </Field>

      <Button type="submit" size="lg" variant="tape" disabled={loading} className="mt-1 w-full">
        {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
        {loading ? "Creating your account" : "Create account"}
      </Button>
    </form>
  );
}
