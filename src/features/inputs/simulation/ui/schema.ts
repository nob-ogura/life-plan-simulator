import { z } from "zod";

import { optionalNumericString, requiredNumericString } from "@/features/inputs/shared/form-utils";

export const SimulationSectionSchema = z.object({
  start_offset_months: optionalNumericString,
  end_age: requiredNumericString,
  mortgage_transaction_cost_rate: optionalNumericString,
  real_estate_tax_rate: optionalNumericString,
  real_estate_evaluation_rate: optionalNumericString,
});

export type SimulationSectionInput = z.input<typeof SimulationSectionSchema>;
export type SimulationSectionPayload = z.output<typeof SimulationSectionSchema>;
