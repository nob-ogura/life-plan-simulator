"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { ListAssetsEndpoint } from "./endpoint";
import { ListAssetsQueryHandler } from "./handler";
import { SupabaseListAssetsRepository } from "./repository";
import { ListAssetsRequestSchema } from "./request";

export const listAssetsAction = createActionResponse(ListAssetsRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseListAssetsRepository(client);
  const handler = new ListAssetsQueryHandler(repository);
  return new ListAssetsEndpoint(handler, auth);
});
