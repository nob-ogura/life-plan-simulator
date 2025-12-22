"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/shared/cross-cutting/auth";

export default function LoginPage() {
  const router = useRouter();
  const { session, isReady, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (session) {
      router.replace("/");
    }
  }, [isReady, router, session]);

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await login({ redirectTo: `${window.location.origin}/` });
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
          <h1 className="text-2xl font-semibold tracking-tight">Log in to continue</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with GitHub to access your dashboard.
          </p>
        </div>
        <Button className="w-full" size="lg" onClick={handleLogin} disabled={isSubmitting}>
          Continue with GitHub
        </Button>
      </div>
    </div>
  );
}
