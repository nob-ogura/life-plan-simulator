import type { SupabaseClient } from "@supabase/supabase-js";

import { toUserOwnedInsert } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { UpsertProfileCommand, UpsertProfileRepository } from "./handler";
import type { UpsertProfileResponse } from "./response";

export class SupabaseUpsertProfileRepository implements UpsertProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async upsert(command: UpsertProfileCommand): Promise<UpsertProfileResponse> {
    const payload = toUserOwnedInsert({ userId: command.userId, ...command.patch });
    const { data, error } = await this.client
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
