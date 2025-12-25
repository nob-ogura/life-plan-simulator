import { z } from "zod";

// Define the input fields for this endpoint.
export const ExampleRequestSchema = z.object({}).strict();

export type ExampleRequest = z.infer<typeof ExampleRequestSchema>;
