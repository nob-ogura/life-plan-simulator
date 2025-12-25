"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { ListExpensesEndpoint } from "./endpoint";
import { ListExpensesQueryHandler } from "./handler";
import { SupabaseListExpensesRepository } from "./repository";
import { ListExpensesRequestSchema } from "./request";

export const listExpensesAction = createActionResponse(ListExpensesRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseListExpensesRepository(client);
  const handler = new ListExpensesQueryHandler(repository);
  return new ListExpensesEndpoint(handler, auth);
});
