"use client";

import type { ReadonlyURLSearchParams } from "next/navigation";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "./useAuth";

const buildRedirectPath = (pathname: string, searchParams: ReadonlyURLSearchParams | null) => {
  const search = searchParams?.toString();
  return search ? `${pathname}?${search}` : pathname;
};

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session, isReady } = useAuth();
  const redirectPath = buildRedirectPath(pathname ?? "/", searchParams);

  useEffect(() => {
    if (!isReady || session) return;
    router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }, [isReady, session, router, redirectPath]);

  if (!isReady || !session) {
    return null;
  }

  return <>{children}</>;
}
