import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";
import AuthShell from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      lede="Sign in to pick up where you left off."
      wallLine="Your next hold is waiting."
      footer={
        <>
          New to MentorMatch?{" "}
          <Link href="/signup" className="font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
