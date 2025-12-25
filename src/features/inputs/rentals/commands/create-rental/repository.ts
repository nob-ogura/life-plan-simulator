import type { SupabaseClient } from "@supabase/supabase-js";

import { toUserOwnedInsert } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { CreateRentalCommand, CreateRentalRepository } from "./handler";
import type { CreateRentalResponse } from "./response";

export class SupabaseCreateRentalRepository implements CreateRentalRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateRentalCommand): Promise<CreateRentalResponse> {
    const { data, error } = await this.client
      .from("rentals")
      .insert(toUserOwnedInsert(command))
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
