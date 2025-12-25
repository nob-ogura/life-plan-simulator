import type { SupabaseClient } from "@supabase/supabase-js";

import { toUserOwnedInsert } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { CreateIncomeStreamCommand, CreateIncomeStreamRepository } from "./handler";
import type { CreateIncomeStreamResponse } from "./response";

export class SupabaseCreateIncomeStreamRepository implements CreateIncomeStreamRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateIncomeStreamCommand): Promise<CreateIncomeStreamResponse> {
    const { data, error } = await this.client
      .from("income_streams")
      .insert(toUserOwnedInsert(command))
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
