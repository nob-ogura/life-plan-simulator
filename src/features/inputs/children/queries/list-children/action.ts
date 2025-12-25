"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { ListChildrenEndpoint } from "./endpoint";
import { ListChildrenQueryHandler } from "./handler";
import { SupabaseListChildrenRepository } from "./repository";
import { ListChildrenRequestSchema } from "./request";

export const listChildrenAction = createActionResponse(ListChildrenRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseListChildrenRepository(client);
  const handler = new ListChildrenQueryHandler(repository);
  return new ListChildrenEndpoint(handler, auth);
});
