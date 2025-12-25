"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { UpdateLifeEventEndpoint } from "./endpoint";
import { UpdateLifeEventCommandHandler } from "./handler";
import { SupabaseUpdateLifeEventRepository } from "./repository";
import { UpdateLifeEventRequestSchema } from "./request";

export const updateLifeEventAction = createActionResponse(UpdateLifeEventRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseUpdateLifeEventRepository(client);
  const handler = new UpdateLifeEventCommandHandler(repository);
  return new UpdateLifeEventEndpoint(handler, auth);
});
