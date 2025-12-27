import { z } from "zod";

const UpsertProfilePatchSchema = z
  .object({
    birth_year: z.number(),
    birth_month: z.number(),
    spouse_birth_year: z.number(),
    spouse_birth_month: z.number(),
    pension_start_age: z.number(),
  })
  .partial()
  .strict();

export const UpsertProfileRequestSchema = z
  .object({
    patch: UpsertProfilePatchSchema,
  })
  .strict();

export type UpsertProfileRequest = z.infer<typeof UpsertProfileRequestSchema>;
