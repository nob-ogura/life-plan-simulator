import { z } from "zod";

export const ListChildrenRequestSchema = z.object({}).strict();

export type ListChildrenRequest = z.infer<typeof ListChildrenRequestSchema>;
