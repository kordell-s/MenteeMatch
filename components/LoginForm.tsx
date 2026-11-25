"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/auth/AuthShell";

export default function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email) next.email = "Enter your email address.";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "That doesn't look like an email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (!result || result.error) {
      setLoading(false);
      setErrors({ general: "That email and password don't match. Check them and try again." });
      return;
    }
    // The session cookie is set by now; a full navigation picks it up everywhere.
    const callback = params.get("callbackUrl");
    window.location.href = callback && callback.startsWith("/") ? callback : "/dashboard";
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      {errors.general && (
        <p role="alert" className="rounded-[10px] bg-tape-red-soft px-3.5 py-3 text-[15px] text-red-800">
          {errors.general}
        </p>
      )}

      <Field id="email" label="Email" error={errors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
      </Field>

      <Field id="password" label="Password" error={errors.password}>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
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
      </Field>

      <Button type="submit" size="lg" variant="tape" disabled={loading} className="mt-1 w-full">
        {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
        {loading ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
