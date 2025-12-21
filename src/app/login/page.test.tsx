import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/login/page";

const { replace, signInWithOAuth, getSession } = vi.hoisted(() => ({
  replace: vi.fn(),
  signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
  getSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/lib/supabaseClient", () => ({
  supabaseClient: {
    auth: {
      getSession,
      signInWithOAuth,
    },
  },
}));

describe("LoginPage", () => {
  beforeEach(() => {
    replace.mockClear();
    signInWithOAuth.mockClear();
    getSession.mockReset();
    getSession.mockResolvedValue({ data: { session: null } });
  });

  it("redirects to dashboard when session exists", async () => {
    getSession.mockResolvedValueOnce({
      data: { session: { user: { id: "user-1" } } },
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/");
    });
  });

  it("starts GitHub OAuth when the login button is clicked", async () => {
    getSession.mockResolvedValueOnce({ data: { session: null } });

    render(<LoginPage />);

    const button = await screen.findByRole("button", { name: "Continue with GitHub" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: "github",
        options: { redirectTo: `${window.location.origin}/` },
      });
    });
  });
});
