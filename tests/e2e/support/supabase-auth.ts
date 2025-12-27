import type { Cookie } from "@playwright/test";
import type { CookieOptions } from "@supabase/ssr";
import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "../../../src/types/supabase";

type StoredCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

type CreateAuthCookiesParams = {
  baseURL: string;
  email: string;
  password: string;
};

const getSupabaseEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for E2E auth.",
    );
  }

  return { supabaseUrl, publishableKey };
};

const resolveSameSite = (value?: CookieOptions["sameSite"]): Cookie["sameSite"] => {
  if (!value) return "Lax";
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "none") return "None";
    if (normalized === "strict") return "Strict";
    return "Lax";
  }
  if (value === true) return "Lax";
  return "Lax";
};

const resolveExpires = (options?: CookieOptions): number | undefined => {
  if (!options) return undefined;
  if (options.expires instanceof Date) {
    return Math.floor(options.expires.getTime() / 1000);
  }
  if (typeof options.expires === "number") {
    return Math.floor(options.expires);
  }
  if (typeof options.expires === "string") {
    const parsed = Date.parse(options.expires);
    if (!Number.isNaN(parsed)) {
      return Math.floor(parsed / 1000);
    }
  }
  if (typeof options.maxAge === "number") {
    return Math.floor(Date.now() / 1000 + options.maxAge);
  }
  return undefined;
};

const toPlaywrightCookies = (cookies: StoredCookie[], baseURL: string): Cookie[] => {
  const origin = new URL(baseURL);

  return cookies.map((cookie) => {
    const path = cookie.options?.path ?? "/";

    const expires = resolveExpires(cookie.options) ?? -1;

    return {
      name: cookie.name,
      value: cookie.value,
      domain: cookie.options?.domain ?? origin.hostname,
      path,
      httpOnly: cookie.options?.httpOnly ?? false,
      secure: cookie.options?.secure ?? origin.protocol === "https:",
      sameSite: resolveSameSite(cookie.options?.sameSite),
      expires,
    } satisfies Cookie;
  });
};

export const createSupabaseAuthCookies = async ({
  baseURL,
  email,
  password,
}: CreateAuthCookiesParams): Promise<Cookie[]> => {
  const { supabaseUrl, publishableKey } = getSupabaseEnv();
  const cookieStore = new Map<string, StoredCookie>();

  const client = createBrowserClient<Database>(supabaseUrl, publishableKey, {
    cookies: {
      getAll: () => Array.from(cookieStore.values()).map(({ name, value }) => ({ name, value })),
      setAll: (nextCookies) => {
        nextCookies.forEach((cookie) => {
          cookieStore.set(cookie.name, cookie);
        });
      },
    },
  });

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }

  return toPlaywrightCookies(Array.from(cookieStore.values()), baseURL);
};
