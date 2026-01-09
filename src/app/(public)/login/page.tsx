"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/shared/cross-cutting/auth";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isReady, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectPath = (() => {
    const candidate = searchParams.get("redirect");
    if (!candidate || !candidate.startsWith("/")) {
      return "/";
    }
    return candidate;
  })();

  useEffect(() => {
    if (!isReady) return;
    if (session) {
      router.replace(redirectPath);
    }
  }, [isReady, redirectPath, router, session]);

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await login({ redirectTo: `${window.location.origin}${redirectPath}` });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Authentication
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Life Plan Simulator</h1>
          <p className="text-sm text-muted-foreground">生活設計診断</p>
        </div>
        <Button className="w-full" size="lg" onClick={handleLogin} disabled={isSubmitting}>
          GitHub アカウントでサインイン
        </Button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
