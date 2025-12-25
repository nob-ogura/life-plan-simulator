import { z } from "zod";

export const DeleteChildRequestSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export type DeleteChildRequest = z.infer<typeof DeleteChildRequestSchema>;
