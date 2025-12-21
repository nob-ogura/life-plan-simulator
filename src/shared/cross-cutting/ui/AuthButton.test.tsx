import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthButton } from "@/shared/cross-cutting/ui/AuthButton";

const { replace, signOut, getSession, onAuthStateChange } = vi.hoisted(() => ({
  replace: vi.fn(),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/lib/supabaseClient", () => ({
  supabaseClient: {
    auth: {
      getSession,
      onAuthStateChange,
      signOut,
    },
  },
}));

describe("AuthButton", () => {
  beforeEach(() => {
    replace.mockClear();
    signOut.mockClear();
    getSession.mockReset();
  });

  it("shows a login link when no session exists", async () => {
    getSession.mockResolvedValueOnce({ data: { session: null } });

    render(<AuthButton />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    });
  });

  it("signs out and redirects to /login when session exists", async () => {
    getSession.mockResolvedValueOnce({
      data: { session: { user: { id: "user-1" } } },
    });

    render(<AuthButton />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith("/login");
    });
  });
});
