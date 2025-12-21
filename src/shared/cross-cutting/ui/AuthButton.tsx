"use client";

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/lib/supabaseClient";

export function AuthButton() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setIsReady(true);
    });

    const { data } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsReady(true);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.replace("/login");
  };

  if (!isReady) {
    return (
      <Button variant="secondary" size="sm" disabled aria-label="Loading auth">
        Loading...
      </Button>
    );
  }

  if (!session) {
    return (
      <Button asChild variant="secondary" size="sm">
        <Link href="/login">Log in</Link>
      </Button>
    );
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleLogout}>
      Log out
    </Button>
  );
}
