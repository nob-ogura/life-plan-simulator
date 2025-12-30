import { z } from "zod";

import { IncomeSectionSchema } from "@/features/inputs/income-streams/ui/schema";

export const BulkSaveIncomeStreamsRequestSchema = z
  .object({
    initial_ids: z.array(z.string()),
    streams: IncomeSectionSchema.shape.streams,
  })
  .strict();

export type BulkSaveIncomeStreamsRequest = z.infer<typeof BulkSaveIncomeStreamsRequestSchema>;
