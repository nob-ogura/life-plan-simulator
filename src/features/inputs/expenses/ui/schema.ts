import { z } from "zod";

import {
  arrayWithDefault,
  optionalNumericString,
  optionalYearMonth,
  requiredNumericString,
  requiredYearMonth,
} from "@/features/inputs/shared/form-utils";
import { EXPENSE_CATEGORY_VALUES } from "@/shared/domain/expenses/categories";

const requiredString = z.string().trim().min(1, { message: "必須項目です" });
const expenseCategorySchema = z.enum(EXPENSE_CATEGORY_VALUES);
const categorySchema = z
  .union([expenseCategorySchema, z.literal("")])
  .refine((value) => value !== "", { message: "必須項目です" });

const ExpenseFormSchema = z.object({
  id: z.string().optional(),
  label: requiredString,
  amount_monthly: requiredNumericString,
  inflation_rate: optionalNumericString,
  category: categorySchema,
  start_year_month: requiredYearMonth,
  end_year_month: optionalYearMonth,
});

export const ExpenseSectionSchema = z.object({
  expenses: arrayWithDefault(ExpenseFormSchema),
});

export type ExpenseSectionInput = z.input<typeof ExpenseSectionSchema>;
export type ExpenseSectionPayload = z.output<typeof ExpenseSectionSchema>;
