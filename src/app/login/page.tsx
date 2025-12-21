"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        router.replace("/");
      }
    });

    return () => {
      active = false;
    };
  }, [router]);

  const handleLogin = async () => {
    setIsSubmitting(true);
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo },
    });

    if (error) {
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
