"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { CreateLifeEventEndpoint } from "./endpoint";
import { CreateLifeEventCommandHandler } from "./handler";
import { SupabaseCreateLifeEventRepository } from "./repository";
import { CreateLifeEventRequestSchema } from "./request";

export const createLifeEventAction = createActionResponse(CreateLifeEventRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseCreateLifeEventRepository(client);
  const handler = new CreateLifeEventCommandHandler(repository);
  return new CreateLifeEventEndpoint(handler, auth);
});
