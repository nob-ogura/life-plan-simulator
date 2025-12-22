import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthContextValue } from "@/shared/cross-cutting/auth";
import { createMockSession, createMockUser } from "@/test/factories/auth";
import { RequireAuth } from "./RequireAuth";
import { useAuth } from "./useAuth";

const { replace, getPathname, getSearchParams, setPathname, setSearchParams } = vi.hoisted(() => {
  let pathname = "/inputs";
  let searchParams = "";

  return {
    replace: vi.fn(),
    getPathname: () => pathname,
    getSearchParams: () => new URLSearchParams(searchParams),
    setPathname: (value: string) => {
      pathname = value;
    },
    setSearchParams: (value: string) => {
      searchParams = value;
    },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => getPathname(),
  useSearchParams: () => getSearchParams(),
}));

vi.mock("./useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("RequireAuth", () => {
  beforeEach(() => {
    replace.mockClear();
    mockedUseAuth.mockReset();
    setPathname("/inputs");
    setSearchParams("");
  });

  it("renders children when session exists", () => {
    const authValue: AuthContextValue = {
      session: createMockSession({ user: createMockUser({ id: "user-1" }) }),
      isReady: true,
      login: vi.fn(),
      logout: vi.fn(),
    };

    mockedUseAuth.mockReturnValue(authValue);

    render(
      <RequireAuth>
        <div>Protected Content</div>
      </RequireAuth>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to login with redirect param when session is missing", async () => {
    const authValue: AuthContextValue = {
      session: null,
      isReady: true,
      login: vi.fn(),
      logout: vi.fn(),
    };

    mockedUseAuth.mockReturnValue(authValue);
    setSearchParams("tab=yearly");

    render(
      <RequireAuth>
        <div>Protected Content</div>
      </RequireAuth>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/login?redirect=%2Finputs%3Ftab%3Dyearly");
    });
  });

  it("does not redirect until auth is ready", () => {
    const authValue: AuthContextValue = {
      session: null,
      isReady: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    mockedUseAuth.mockReturnValue(authValue);

    render(
      <RequireAuth>
        <div>Protected Content</div>
      </RequireAuth>,
    );

    expect(replace).not.toHaveBeenCalled();
  });
});
