"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { BulkSaveIncomeStreamsEndpoint } from "./endpoint";
import { BulkSaveIncomeStreamsCommandHandler } from "./handler";
import { SupabaseBulkSaveIncomeStreamsRepository } from "./repository";
import { BulkSaveIncomeStreamsRequestSchema } from "./request";

export const bulkSaveIncomeStreamsAction = createAction(BulkSaveIncomeStreamsRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseBulkSaveIncomeStreamsRepository(client);
  const handler = new BulkSaveIncomeStreamsCommandHandler(repository);
  return new BulkSaveIncomeStreamsEndpoint(handler, auth);
});
