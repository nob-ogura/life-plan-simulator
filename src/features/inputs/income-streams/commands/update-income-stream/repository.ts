import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { UpdateIncomeStreamCommand, UpdateIncomeStreamRepository } from "./handler";
import type { UpdateIncomeStreamResponse } from "./response";

export class SupabaseUpdateIncomeStreamRepository implements UpdateIncomeStreamRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateIncomeStreamCommand): Promise<UpdateIncomeStreamResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await scopeByUserAndId(
      this.client.from("income_streams").update(patch),
      userId,
      id,
    )
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
