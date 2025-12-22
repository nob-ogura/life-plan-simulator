import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthContextValue } from "@/shared/cross-cutting/auth";
import { useAuth } from "@/shared/cross-cutting/auth";
import { AuthButton } from "@/shared/cross-cutting/ui/AuthButton";
import { createMockSession, createMockUser } from "@/test/factories/auth";

const { logout } = vi.hoisted(() => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/shared/cross-cutting/auth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("AuthButton", () => {
  beforeEach(() => {
    logout.mockClear();
    mockedUseAuth.mockReset();
  });

  it("shows a login link when no session exists", async () => {
    const authValue: AuthContextValue = {
      session: null,
      isReady: true,
      login: vi.fn(),
      logout,
    };

    mockedUseAuth.mockReturnValue(authValue);

    render(<AuthButton />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    });
  });

  it("calls logout when session exists", async () => {
    const authValue: AuthContextValue = {
      session: createMockSession({ user: createMockUser({ id: "user-1" }) }),
      isReady: true,
      login: vi.fn(),
      logout,
    };

    mockedUseAuth.mockReturnValue(authValue);

    render(<AuthButton />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
    });
  });
});
