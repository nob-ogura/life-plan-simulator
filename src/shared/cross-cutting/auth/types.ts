import type { Provider, Session } from "@supabase/supabase-js";

export type LoginOptions = {
  provider?: Provider;
  redirectTo?: string;
};

export type LogoutOptions = {
  redirectTo?: string;
};

export type AuthState = {
  session: Session | null;
  isReady: boolean;
};

export type AuthContextValue = AuthState & {
  login: (options?: LoginOptions) => Promise<void>;
  logout: (options?: LogoutOptions) => Promise<void>;
};
