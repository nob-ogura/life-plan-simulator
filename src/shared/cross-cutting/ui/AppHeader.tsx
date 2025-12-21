import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            LP
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold">Life Plan Simulator</span>
            <span className="text-xs text-muted-foreground">MVP workspace</span>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link className="transition-colors hover:text-foreground" href="/">
            Dashboard
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/inputs">
            Inputs
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/settings">
            Settings
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            Log in
          </Button>
        </div>
      </div>
    </header>
  );
}
