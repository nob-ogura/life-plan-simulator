import { z } from "zod";

export const DeleteIncomeStreamRequestSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export type DeleteIncomeStreamRequest = z.infer<typeof DeleteIncomeStreamRequestSchema>;
