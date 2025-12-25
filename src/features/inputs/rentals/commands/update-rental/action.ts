"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { UpdateRentalEndpoint } from "./endpoint";
import { UpdateRentalCommandHandler } from "./handler";
import { SupabaseUpdateRentalRepository } from "./repository";
import { UpdateRentalRequestSchema } from "./request";

export const updateRentalAction = createActionResponse(UpdateRentalRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseUpdateRentalRepository(client);
  const handler = new UpdateRentalCommandHandler(repository);
  return new UpdateRentalEndpoint(handler, auth);
});
