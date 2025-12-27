"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { UpsertRetirementBonusEndpoint } from "./endpoint";
import { UpsertRetirementBonusCommandHandler } from "./handler";
import { SupabaseUpsertRetirementBonusRepository } from "./repository";
import { UpsertRetirementBonusRequestSchema } from "./request";

export const upsertRetirementBonusAction = createAction(UpsertRetirementBonusRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseUpsertRetirementBonusRepository(client);
  const handler = new UpsertRetirementBonusCommandHandler(repository);
  return new UpsertRetirementBonusEndpoint(handler, auth);
});
