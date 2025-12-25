import { z } from "zod";

export const ListLifeEventsRequestSchema = z.object({}).strict();

export type ListLifeEventsRequest = z.infer<typeof ListLifeEventsRequestSchema>;
