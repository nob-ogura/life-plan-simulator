"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { UpdateExpenseEndpoint } from "./endpoint";
import { UpdateExpenseCommandHandler } from "./handler";
import { SupabaseUpdateExpenseRepository } from "./repository";
import { UpdateExpenseRequestSchema } from "./request";

export const updateExpenseAction = createAction(UpdateExpenseRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseUpdateExpenseRepository(client);
  const handler = new UpdateExpenseCommandHandler(repository);
  return new UpdateExpenseEndpoint(handler, auth);
});
