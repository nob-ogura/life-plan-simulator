import type { CreateExpenseRequest } from "@/features/inputs/expenses/commands/create-expense/request";
import {
  toMonthStartDate,
  toOptionalMonthStartDate,
  toYearMonthInput,
} from "@/features/inputs/shared/date";
import type { Tables } from "@/types/supabase";

import type { ExpenseSectionInput, ExpenseSectionPayload } from "./schema";

const toNumberInput = (value?: number | null) => (value == null ? "" : String(value));

export const buildExpenseSectionDefaults = (
  expenses: Array<Tables<"expenses">>,
): ExpenseSectionInput => ({
  expenses: expenses.map((expense) => ({
    id: expense.id,
    label: expense.label,
    amount_monthly: toNumberInput(expense.amount_monthly),
    inflation_rate: toNumberInput(expense.inflation_rate),
    category: expense.category,
    start_year_month: toYearMonthInput(expense.start_year_month),
    end_year_month: toYearMonthInput(expense.end_year_month),
  })),
});

export const toExpensePayloads = (value: ExpenseSectionPayload): CreateExpenseRequest[] =>
  value.expenses.map((expense) => ({
    label: expense.label,
    amount_monthly: expense.amount_monthly,
    inflation_rate: expense.inflation_rate,
    category: expense.category,
    start_year_month: toMonthStartDate(expense.start_year_month),
    end_year_month: toOptionalMonthStartDate(expense.end_year_month),
  }));
