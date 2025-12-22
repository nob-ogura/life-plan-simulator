"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { supabaseClient } from "@/shared/cross-cutting/infrastructure/supabase";

import type { AuthContextValue, LoginOptions, LogoutOptions } from "./types";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthContextValue["session"]>(null);
  const [isReady, setIsReady] = useState(false);

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

  const login = useCallback(async (options?: LoginOptions) => {
    const provider = options?.provider ?? "github";
    const redirectTo = options?.redirectTo ?? `${window.location.origin}/`;
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(
    async (options?: LogoutOptions) => {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        throw error;
      }
      const redirectTo = options?.redirectTo ?? "/login";
      router.replace(redirectTo);
    },
    [router],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isReady,
      login,
      logout,
    }),
    [session, isReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
