"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { CreateMortgageEndpoint } from "./endpoint";
import { CreateMortgageCommandHandler } from "./handler";
import { SupabaseCreateMortgageRepository } from "./repository";
import { CreateMortgageRequestSchema } from "./request";

export const createMortgageAction = createActionResponse(CreateMortgageRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseCreateMortgageRepository(client);
  const handler = new CreateMortgageCommandHandler(repository);
  return new CreateMortgageEndpoint(handler, auth);
});
