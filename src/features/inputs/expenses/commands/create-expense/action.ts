"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { CreateExpenseEndpoint } from "./endpoint";
import { CreateExpenseCommandHandler } from "./handler";
import { SupabaseCreateExpenseRepository } from "./repository";
import { CreateExpenseRequestSchema } from "./request";

export const createExpenseAction = createAction(CreateExpenseRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseCreateExpenseRepository(client);
  const handler = new CreateExpenseCommandHandler(repository);
  return new CreateExpenseEndpoint(handler, auth);
});
