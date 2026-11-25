import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import SignupForm from "@/components/SignupForm";
import AuthShell from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      lede="It takes a minute. Then we'll ask what you're working toward."
      wallLine="Every route starts at the bottom."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
