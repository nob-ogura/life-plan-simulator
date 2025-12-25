import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { UpdateMortgageCommand, UpdateMortgageRepository } from "./handler";
import type { UpdateMortgageResponse } from "./response";

export class SupabaseUpdateMortgageRepository implements UpdateMortgageRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateMortgageCommand): Promise<UpdateMortgageResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await scopeByUserAndId(
      this.client.from("mortgages").update(patch),
      userId,
      id,
    )
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
