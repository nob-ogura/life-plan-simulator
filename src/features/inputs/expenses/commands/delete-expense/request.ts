import { z } from "zod";

export const DeleteExpenseRequestSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export type DeleteExpenseRequest = z.infer<typeof DeleteExpenseRequestSchema>;
