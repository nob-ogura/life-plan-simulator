import { z } from "zod";

export const ListRentalsRequestSchema = z.object({}).strict();

export type ListRentalsRequest = z.infer<typeof ListRentalsRequestSchema>;
