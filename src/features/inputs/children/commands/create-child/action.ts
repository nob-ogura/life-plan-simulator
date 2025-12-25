"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { CreateChildEndpoint } from "./endpoint";
import { CreateChildCommandHandler } from "./handler";
import { SupabaseCreateChildRepository } from "./repository";
import { CreateChildRequestSchema } from "./request";

export const createChildAction = createActionResponse(CreateChildRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseCreateChildRepository(client);
  const handler = new CreateChildCommandHandler(repository);
  return new CreateChildEndpoint(handler, auth);
});
