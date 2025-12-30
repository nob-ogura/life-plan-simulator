import { z } from "zod";

import {
  arrayWithDefault,
  optionalNumericString,
  optionalYearMonth,
  requiredNumericString,
  requiredYearMonth,
} from "@/features/inputs/shared/form-utils";

const requiredString = z.string().trim().min(1, { message: "必須項目です" });

const ExpenseFormSchema = z.object({
  id: z.string().optional(),
  label: requiredString,
  amount_monthly: requiredNumericString,
  inflation_rate: optionalNumericString,
  category: requiredString,
  start_year_month: requiredYearMonth,
  end_year_month: optionalYearMonth,
});

export const ExpenseSectionSchema = z.object({
  expenses: arrayWithDefault(ExpenseFormSchema),
});

export type ExpenseSectionInput = z.input<typeof ExpenseSectionSchema>;
export type ExpenseSectionPayload = z.output<typeof ExpenseSectionSchema>;
