import { RequireAuth } from "@/shared/cross-cutting/auth";
import { AppHeader } from "@/shared/cross-cutting/ui/AppHeader";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
