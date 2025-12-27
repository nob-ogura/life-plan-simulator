"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { DeleteExpenseEndpoint } from "./endpoint";
import { DeleteExpenseCommandHandler } from "./handler";
import { SupabaseDeleteExpenseRepository } from "./repository";
import { DeleteExpenseRequestSchema } from "./request";

export const deleteExpenseAction = createAction(DeleteExpenseRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseDeleteExpenseRepository(client);
  const handler = new DeleteExpenseCommandHandler(repository);
  return new DeleteExpenseEndpoint(handler, auth);
});
