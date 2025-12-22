import type { Session, User } from "@supabase/supabase-js";

const baseUser = (id: string): User => ({
  id,
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date(0).toISOString(),
});

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  ...baseUser(overrides.id ?? "user-1"),
  ...overrides,
});

export const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  access_token: "access-token",
  refresh_token: "refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  user: createMockUser(),
  ...overrides,
});
