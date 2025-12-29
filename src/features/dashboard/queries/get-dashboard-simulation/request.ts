import { z } from "zod";

export const GetDashboardSimulationRequestSchema = z.object({}).strict();

export type GetDashboardSimulationRequest = z.infer<typeof GetDashboardSimulationRequestSchema>;
