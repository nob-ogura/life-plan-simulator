import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { UpdateRentalCommand, UpdateRentalRepository } from "./handler";
import type { UpdateRentalResponse } from "./response";

export class SupabaseUpdateRentalRepository implements UpdateRentalRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateRentalCommand): Promise<UpdateRentalResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await scopeByUserAndId(
      this.client.from("rentals").update(patch),
      userId,
      id,
    )
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
