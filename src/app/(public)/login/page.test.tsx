import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthContextValue } from "@/shared/cross-cutting/auth";
import { useAuth } from "@/shared/cross-cutting/auth";
import { createMockSession, createMockUser } from "@/test/factories/auth";
import LoginPage from "./page";

const { replace, login } = vi.hoisted(() => ({
  replace: vi.fn(),
  login: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/shared/cross-cutting/auth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("LoginPage", () => {
  beforeEach(() => {
    replace.mockClear();
    login.mockClear();
    mockedUseAuth.mockReset();
  });

  it("redirects to dashboard when session exists", async () => {
    const authValue: AuthContextValue = {
      session: createMockSession({ user: createMockUser({ id: "user-1" }) }),
      isReady: true,
      login,
      logout: vi.fn(),
    };

    mockedUseAuth.mockReturnValue(authValue);

    render(<LoginPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/");
    });
  });

  it("starts GitHub OAuth when the login button is clicked", async () => {
    const authValue: AuthContextValue = {
      session: null,
      isReady: true,
      login,
      logout: vi.fn(),
    };

    mockedUseAuth.mockReturnValue(authValue);

    render(<LoginPage />);

    const button = await screen.findByRole("button", { name: "Continue with GitHub" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        redirectTo: `${window.location.origin}/`,
      });
    });
  });
});
