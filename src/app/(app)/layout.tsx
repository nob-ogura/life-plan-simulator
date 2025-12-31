import { Suspense } from "react";

import { RequireAuth } from "@/shared/cross-cutting/auth";
import { AppHeader } from "@/shared/cross-cutting/ui/AppHeader";

export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <RequireAuth>
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
          </main>
        </div>
      </RequireAuth>
    </Suspense>
  );
}
