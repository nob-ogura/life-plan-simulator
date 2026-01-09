import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/(public)/login/page";
import type { AuthContextValue } from "@/shared/cross-cutting/auth";
import { useAuth } from "@/shared/cross-cutting/auth";
import { createMockSession, createMockUser } from "@/test/factories/auth";

const { replace, login, getSearchParams, setSearchParams } = vi.hoisted(() => {
  let searchParams = "";

  return {
    replace: vi.fn(),
    login: vi.fn().mockResolvedValue(undefined),
    getSearchParams: () => new URLSearchParams(searchParams),
    setSearchParams: (value: string) => {
      searchParams = value;
    },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => getSearchParams(),
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
    setSearchParams("");
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

  it("redirects to requested path when redirect param is set", async () => {
    setSearchParams("redirect=/inputs");

    const authValue: AuthContextValue = {
      session: createMockSession({ user: createMockUser({ id: "user-1" }) }),
      isReady: true,
      login,
      logout: vi.fn(),
    };

    mockedUseAuth.mockReturnValue(authValue);

    render(<LoginPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/inputs");
    });
  });

  it("starts GitHub OAuth when the login button is clicked", async () => {
    setSearchParams("redirect=/inputs");

    const authValue: AuthContextValue = {
      session: null,
      isReady: true,
      login,
      logout: vi.fn(),
    };

    mockedUseAuth.mockReturnValue(authValue);

    render(<LoginPage />);

    const button = await screen.findByRole("button", { name: "GitHub アカウントでサインイン" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        redirectTo: `${window.location.origin}/inputs`,
      });
    });
  });
});
