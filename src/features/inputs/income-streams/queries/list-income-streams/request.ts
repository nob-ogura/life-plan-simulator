import { z } from "zod";

export const ListIncomeStreamsRequestSchema = z.object({}).strict();

export type ListIncomeStreamsRequest = z.infer<typeof ListIncomeStreamsRequestSchema>;
