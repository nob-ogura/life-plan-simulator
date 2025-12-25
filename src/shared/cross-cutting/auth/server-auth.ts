import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ActionError } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";
import type { Database } from "@/types/supabase";

export type AuthSession = {
  requireUserId: () => Promise<string>;
};

export class ServerAuthSession implements AuthSession {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async requireUserId(): Promise<string> {
    const { data, error } = await this.client.auth.getUser();
    if (error || !data.user) {
      const authError: ActionError = { type: "unauthorized", message: "Unauthorized" };
      throw authError;
    }

    return data.user.id;
  }
}

export const createServerAuthSession = (
  client: SupabaseClient<Database> = createServerSupabaseClient(),
) => new ServerAuthSession(client);
