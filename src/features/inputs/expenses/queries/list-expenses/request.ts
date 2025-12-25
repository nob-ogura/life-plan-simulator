import { z } from "zod";

export const ListExpensesRequestSchema = z.object({}).strict();

export type ListExpensesRequest = z.infer<typeof ListExpensesRequestSchema>;
