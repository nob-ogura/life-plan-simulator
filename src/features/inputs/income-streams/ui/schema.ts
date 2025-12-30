import { z } from "zod";

import {
  arrayWithDefault,
  optionalNumericString,
  optionalYearMonth,
  requiredNumericString,
  requiredYearMonth,
} from "@/features/inputs/shared/form-utils";

const requiredString = z.string().trim().min(1, { message: "必須項目です" });

const IncomeStreamBaseSchema = z.object({
  id: z.string().optional(),
  label: requiredString,
  take_home_monthly: requiredNumericString,
  raise_rate: optionalNumericString,
  start_year_month: requiredYearMonth,
  end_year_month: optionalYearMonth,
});

export const IncomeSectionSchema = z.object({
  streams: arrayWithDefault(IncomeStreamBaseSchema),
});

export type IncomeSectionInput = z.input<typeof IncomeSectionSchema>;
export type IncomeSectionPayload = z.output<typeof IncomeSectionSchema>;
