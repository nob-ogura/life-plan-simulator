"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { UpdateChildEndpoint } from "./endpoint";
import { UpdateChildCommandHandler } from "./handler";
import { SupabaseUpdateChildRepository } from "./repository";
import { UpdateChildRequestSchema } from "./request";

export const updateChildAction = createAction(UpdateChildRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseUpdateChildRepository(client);
  const handler = new UpdateChildCommandHandler(repository);
  return new UpdateChildEndpoint(handler, auth);
});
