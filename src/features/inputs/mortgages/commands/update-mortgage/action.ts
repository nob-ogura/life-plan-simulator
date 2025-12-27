"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { UpdateMortgageEndpoint } from "./endpoint";
import { UpdateMortgageCommandHandler } from "./handler";
import { SupabaseUpdateMortgageRepository } from "./repository";
import { UpdateMortgageRequestSchema } from "./request";

export const updateMortgageAction = createAction(UpdateMortgageRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseUpdateMortgageRepository(client);
  const handler = new UpdateMortgageCommandHandler(repository);
  return new UpdateMortgageEndpoint(handler, auth);
});
