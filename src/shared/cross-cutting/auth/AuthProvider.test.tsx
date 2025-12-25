import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockSession, createMockUser } from "@/test/factories/auth";

import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./useAuth";

const { getSession, signInWithOAuth, signOut, onAuthStateChange, emitAuthChange, resetAuthMocks } =
  vi.hoisted(() => {
    let listener: ((event: AuthChangeEvent, session: Session | null) => void) | null = null;

    const getSession = vi.fn();
    const signInWithOAuth = vi.fn();
    const signOut = vi.fn();
    const onAuthStateChange = vi.fn((callback: typeof listener) => {
      listener = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    });

    const emitAuthChange = (event: AuthChangeEvent, session: Session | null) => {
      listener?.(event, session);
    };

    const resetAuthMocks = () => {
      getSession.mockReset();
      signInWithOAuth.mockReset();
      signOut.mockReset();
      onAuthStateChange.mockClear();
    };

    return {
      getSession,
      signInWithOAuth,
      signOut,
      onAuthStateChange,
      emitAuthChange,
      resetAuthMocks,
    };
  });

const { replace, refresh } = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

vi.mock("@/shared/cross-cutting/infrastructure/supabase.client", () => ({
  supabaseClient: {
    auth: {
      getSession,
      signInWithOAuth,
      signOut,
      onAuthStateChange,
    },
  },
}));

function AuthStateView() {
  const { session, isReady } = useAuth();

  if (!isReady) {
    return <div>loading</div>;
  }

  if (!session) {
    return <div>no-session</div>;
  }

  return <div>user:{session.user.id}</div>;
}

function LogoutButton({ redirectTo }: { redirectTo?: string }) {
  const { logout } = useAuth();
  return (
    <button type="button" onClick={() => logout({ redirectTo })}>
      logout
    </button>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    replace.mockReset();
    refresh.mockReset();
    resetAuthMocks();
  });

  it("restores the session on app start", async () => {
    const session = createMockSession({ user: createMockUser({ id: "user-1" }) });
    getSession.mockResolvedValue({ data: { session } });

    render(
      <AuthProvider>
        <AuthStateView />
      </AuthProvider>,
    );

    expect(await screen.findByText("user:user-1")).toBeInTheDocument();
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it("updates the session and refreshes the router on auth state change", async () => {
    getSession.mockResolvedValue({ data: { session: null } });

    render(
      <AuthProvider>
        <AuthStateView />
      </AuthProvider>,
    );

    expect(await screen.findByText("no-session")).toBeInTheDocument();

    const session = createMockSession({ user: createMockUser({ id: "user-2" }) });

    act(() => {
      emitAuthChange("SIGNED_IN", session);
    });

    expect(await screen.findByText("user:user-2")).toBeInTheDocument();
    expect(refresh).toHaveBeenCalled();
  });

  it("signs out and redirects on logout", async () => {
    const session = createMockSession({ user: createMockUser({ id: "user-3" }) });
    getSession.mockResolvedValue({ data: { session } });
    signOut.mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <LogoutButton redirectTo="/login" />
      </AuthProvider>,
    );

    await screen.findByText("logout");

    fireEvent.click(screen.getByText("logout"));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
    });
    expect(replace).toHaveBeenCalledWith("/login");
  });
});
