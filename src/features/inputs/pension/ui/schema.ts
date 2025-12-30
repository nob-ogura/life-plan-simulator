import { z } from "zod";

import { requiredNumericString } from "@/features/inputs/shared/form-utils";

export const PensionSectionSchema = z.object({
  pension_start_age: requiredNumericString,
});

export type PensionSectionInput = z.input<typeof PensionSectionSchema>;
export type PensionSectionPayload = z.output<typeof PensionSectionSchema>;
