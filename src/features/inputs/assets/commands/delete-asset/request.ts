import { z } from "zod";

export const DeleteAssetRequestSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export type DeleteAssetRequest = z.infer<typeof DeleteAssetRequestSchema>;
