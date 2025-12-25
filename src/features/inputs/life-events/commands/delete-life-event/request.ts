import { z } from "zod";

export const DeleteLifeEventRequestSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export type DeleteLifeEventRequest = z.infer<typeof DeleteLifeEventRequestSchema>;
