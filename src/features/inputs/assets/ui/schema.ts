import { z } from "zod";

import { optionalNumericString, requiredNumericString } from "@/features/inputs/shared/form-utils";

export const AssetFormSchema = z.object({
  cash_balance: requiredNumericString,
  investment_balance: requiredNumericString,
  return_rate: optionalNumericString,
});

export type AssetFormInput = z.input<typeof AssetFormSchema>;
export type AssetFormPayload = z.output<typeof AssetFormSchema>;
