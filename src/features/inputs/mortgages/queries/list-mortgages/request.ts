import { z } from "zod";

export const ListMortgagesRequestSchema = z.object({}).strict();

export type ListMortgagesRequest = z.infer<typeof ListMortgagesRequestSchema>;
