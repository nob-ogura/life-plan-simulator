import { z } from "zod";

const UpdateAssetPatchSchema = z
  .object({
    cash_balance: z.number(),
    investment_balance: z.number(),
    return_rate: z.number().optional(),
  })
  .partial()
  .strict();

export const UpdateAssetRequestSchema = z
  .object({
    id: z.string().min(1),
    patch: UpdateAssetPatchSchema,
  })
  .strict();

export type UpdateAssetRequest = z.infer<typeof UpdateAssetRequestSchema>;
