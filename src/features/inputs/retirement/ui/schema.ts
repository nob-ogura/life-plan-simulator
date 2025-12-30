import { z } from "zod";

import { requiredNumericString, requiredYearMonth } from "@/features/inputs/shared/form-utils";

const requiredString = z.string().trim().min(1, { message: "必須項目です" });

export const RetirementSectionSchema = z.object({
  label: requiredString,
  amount: requiredNumericString,
  year_month: requiredYearMonth,
});

export type RetirementSectionInput = z.input<typeof RetirementSectionSchema>;
export type RetirementSectionPayload = z.output<typeof RetirementSectionSchema>;
