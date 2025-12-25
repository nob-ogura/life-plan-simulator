"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { CreateRentalEndpoint } from "./endpoint";
import { CreateRentalCommandHandler } from "./handler";
import { SupabaseCreateRentalRepository } from "./repository";
import { CreateRentalRequestSchema } from "./request";

export const createRentalAction = createActionResponse(CreateRentalRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseCreateRentalRepository(client);
  const handler = new CreateRentalCommandHandler(repository);
  return new CreateRentalEndpoint(handler, auth);
});
