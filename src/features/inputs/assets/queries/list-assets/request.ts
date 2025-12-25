import { z } from "zod";

export const ListAssetsRequestSchema = z.object({}).strict();

export type ListAssetsRequest = z.infer<typeof ListAssetsRequestSchema>;
