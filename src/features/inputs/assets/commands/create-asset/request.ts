import { z } from "zod";

export const CreateAssetRequestSchema = z
  .object({
    cash_balance: z.number(),
    investment_balance: z.number(),
    return_rate: z.number().optional(),
  })
  .strict();

export type CreateAssetRequest = z.infer<typeof CreateAssetRequestSchema>;
