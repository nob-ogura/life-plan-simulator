"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/shared/cross-cutting/auth";

export function AuthButton() {
  const { session, isReady, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // noop for now
    }
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
