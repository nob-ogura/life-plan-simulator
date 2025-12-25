import { z } from "zod";

export const DeleteRentalRequestSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export type DeleteRentalRequest = z.infer<typeof DeleteRentalRequestSchema>;
