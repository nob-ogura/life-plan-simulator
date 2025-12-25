import type { SupabaseClient } from "@supabase/supabase-js";

import { toUserOwnedInsert } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { CreateMortgageCommand, CreateMortgageRepository } from "./handler";
import type { CreateMortgageResponse } from "./response";

export class SupabaseCreateMortgageRepository implements CreateMortgageRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateMortgageCommand): Promise<CreateMortgageResponse> {
    const { data, error } = await this.client
      .from("mortgages")
      .insert(toUserOwnedInsert(command))
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
