import { z } from "zod";

export const DeleteMortgageRequestSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export type DeleteMortgageRequest = z.infer<typeof DeleteMortgageRequestSchema>;
