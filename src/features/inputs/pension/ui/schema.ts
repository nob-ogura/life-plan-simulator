import { z } from "zod";

import { optionalNumericString, requiredNumericString } from "@/features/inputs/shared/form-utils";

export const PensionSectionSchema = z.object({
  pension_start_age: requiredNumericString,
  pension_amount_single: optionalNumericString,
  pension_amount_spouse: optionalNumericString,
});

export type PensionSectionInput = z.input<typeof PensionSectionSchema>;
export type PensionSectionPayload = z.output<typeof PensionSectionSchema>;
