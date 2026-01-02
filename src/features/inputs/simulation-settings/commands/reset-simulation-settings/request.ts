import { z } from "zod";

export const ResetSimulationSettingsRequestSchema = z.object({}).strict();

export type ResetSimulationSettingsRequest = z.infer<typeof ResetSimulationSettingsRequestSchema>;
