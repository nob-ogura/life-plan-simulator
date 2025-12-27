"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { DeleteChildEndpoint } from "./endpoint";
import { DeleteChildCommandHandler } from "./handler";
import { SupabaseDeleteChildRepository } from "./repository";
import { DeleteChildRequestSchema } from "./request";

export const deleteChildAction = createAction(DeleteChildRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseDeleteChildRepository(client);
  const handler = new DeleteChildCommandHandler(repository);
  return new DeleteChildEndpoint(handler, auth);
});
