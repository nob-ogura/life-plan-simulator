import { z } from "zod";
import type { CreateAssetRequest } from "@/features/inputs/assets/commands/create-asset/request";
import type { CreateChildRequest } from "@/features/inputs/children/commands/create-child/request";
import type { CreateExpenseRequest } from "@/features/inputs/expenses/commands/create-expense/request";
import type { CreateIncomeStreamRequest } from "@/features/inputs/income-streams/commands/create-income-stream/request";
import type { CreateLifeEventRequest } from "@/features/inputs/life-events/commands/create-life-event/request";
import type { CreateMortgageRequest } from "@/features/inputs/mortgages/commands/create-mortgage/request";
import type { CreateRentalRequest } from "@/features/inputs/rentals/commands/create-rental/request";
import type { Tables } from "@/types/supabase";

const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const requiredString = z.string().trim().min(1, { message: "必須項目です" });

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim())
  .transform((value) => (value === "" ? undefined : value));

const requiredNumericString = z
  .string()
  .trim()
  .min(1, { message: "必須項目です" })
  .refine((value) => !Number.isNaN(Number(value)), {
    message: "数値で入力してください",
  })
  .transform((value) => Number(value));

const optionalNumericString = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim())
  .refine((value) => value === "" || !Number.isNaN(Number(value)), {
    message: "数値で入力してください",
  })
  .transform((value) => (value === "" ? undefined : Number(value)));

const requiredYearMonth = z
  .string()
  .trim()
  .min(1, { message: "必須項目です" })
  .refine((value) => YEAR_MONTH_REGEX.test(value), {
    message: "YYYY-MM 形式で入力してください",
  });

const optionalYearMonth = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim())
  .refine((value) => value === "" || YEAR_MONTH_REGEX.test(value), {
    message: "YYYY-MM 形式で入力してください",
  })
  .transform((value) => (value === "" ? undefined : value));

const bonusMonthsSchema = z
  .array(
    z
      .number({ error: "数値で入力してください" })
      .int({ message: "整数で入力してください" })
      .min(1, { message: "1〜12 の範囲で入力してください" })
      .max(12, { message: "1〜12 の範囲で入力してください" }),
  )
  .optional();

const arrayWithDefault = <T extends z.ZodTypeAny>(schema: T) => z.array(schema).default([]);

const ChildFormSchema = z
  .object({
    id: z.string().optional(),
    label: requiredString,
    birth_year_month: optionalYearMonth,
    due_year_month: optionalYearMonth,
    note: optionalString,
  })
  .superRefine((value, ctx) => {
    if (value.birth_year_month || value.due_year_month) return;
    const message = "出生年月か誕生予定年月のどちらかを入力してください";
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birth_year_month"], message });
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["due_year_month"], message });
  });

export const FamilySectionSchema = z.object({
  profile: z.object({
    birth_year: requiredNumericString,
    birth_month: requiredNumericString,
    spouse_birth_year: requiredNumericString,
    spouse_birth_month: requiredNumericString,
  }),
  children: arrayWithDefault(ChildFormSchema),
});

export type FamilySectionInput = z.input<typeof FamilySectionSchema>;
export type FamilySectionPayload = z.output<typeof FamilySectionSchema>;

const IncomeStreamFormSchema = z.object({
  id: z.string().optional(),
  label: requiredString,
  take_home_monthly: requiredNumericString,
  bonus_months: bonusMonthsSchema,
  bonus_amount: requiredNumericString,
  change_year_month: optionalYearMonth,
  bonus_amount_after: optionalNumericString,
  raise_rate: optionalNumericString,
  start_year_month: requiredYearMonth,
  end_year_month: optionalYearMonth,
});

export const IncomeSectionSchema = z.object({
  streams: arrayWithDefault(IncomeStreamFormSchema),
});

export type IncomeSectionInput = z.input<typeof IncomeSectionSchema>;
export type IncomeSectionPayload = z.output<typeof IncomeSectionSchema>;

export const BonusSectionSchema = z.object({
  streams: arrayWithDefault(
    IncomeStreamFormSchema.pick({
      id: true,
      label: true,
      bonus_months: true,
      bonus_amount: true,
      change_year_month: true,
      bonus_amount_after: true,
    }),
  ),
});

export type BonusSectionInput = z.input<typeof BonusSectionSchema>;
export type BonusSectionPayload = z.output<typeof BonusSectionSchema>;

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

const MortgageFormSchema = z.object({
  id: z.string().optional(),
  principal: requiredNumericString,
  annual_rate: optionalNumericString,
  years: requiredNumericString,
  start_year_month: requiredYearMonth,
  building_price: requiredNumericString,
  land_price: requiredNumericString,
  down_payment: requiredNumericString,
  target_rental_id: optionalString,
});

const RentalFormSchema = z.object({
  id: z.string().optional(),
  rent_monthly: requiredNumericString,
  start_year_month: requiredYearMonth,
  end_year_month: optionalYearMonth,
});

export const HousingSectionSchema = z.object({
  mortgages: arrayWithDefault(MortgageFormSchema),
  rentals: arrayWithDefault(RentalFormSchema),
});

export type HousingSectionInput = z.input<typeof HousingSectionSchema>;
export type HousingSectionPayload = z.output<typeof HousingSectionSchema>;

const LifeEventFormSchema = z.object({
  id: z.string().optional(),
  label: requiredString,
  amount: requiredNumericString,
  year_month: requiredYearMonth,
  repeat_interval_years: optionalNumericString,
  stop_after_occurrences: optionalNumericString,
  category: requiredString,
  auto_toggle_key: optionalString,
  building_price: optionalNumericString,
  land_price: optionalNumericString,
  down_payment: optionalNumericString,
  target_rental_id: optionalString,
});

export const LifeEventSectionSchema = z.object({
  events: arrayWithDefault(LifeEventFormSchema),
});

export type LifeEventSectionInput = z.input<typeof LifeEventSectionSchema>;
export type LifeEventSectionPayload = z.output<typeof LifeEventSectionSchema>;

export const RetirementSectionSchema = z.object({
  label: requiredString,
  amount: requiredNumericString,
  year_month: requiredYearMonth,
});

export type RetirementSectionInput = z.input<typeof RetirementSectionSchema>;
export type RetirementSectionPayload = z.output<typeof RetirementSectionSchema>;

export const PensionSectionSchema = z.object({
  pension_start_age: requiredNumericString,
});

export type PensionSectionInput = z.input<typeof PensionSectionSchema>;
export type PensionSectionPayload = z.output<typeof PensionSectionSchema>;

export const AssetSectionSchema = z.object({
  cash_balance: requiredNumericString,
  investment_balance: requiredNumericString,
  return_rate: optionalNumericString,
});

export type AssetSectionInput = z.input<typeof AssetSectionSchema>;
export type AssetSectionPayload = z.output<typeof AssetSectionSchema>;

export const SimulationSectionSchema = z.object({
  start_offset_months: optionalNumericString,
  end_age: requiredNumericString,
  pension_amount_single: optionalNumericString,
  pension_amount_spouse: optionalNumericString,
  mortgage_transaction_cost_rate: optionalNumericString,
  real_estate_tax_rate: optionalNumericString,
  real_estate_evaluation_rate: optionalNumericString,
});

export type SimulationSectionInput = z.input<typeof SimulationSectionSchema>;
export type SimulationSectionPayload = z.output<typeof SimulationSectionSchema>;

const toYearMonthInput = (value?: string | null) => (value ? value.slice(0, 7) : "");
const toNumberInput = (value?: number | null) => (value == null ? "" : String(value));

export const buildFamilySectionDefaults = (
  profile: Tables<"profiles"> | null,
  children: Array<Tables<"children">>,
): FamilySectionInput => ({
  profile: {
    birth_year: toNumberInput(profile?.birth_year),
    birth_month: toNumberInput(profile?.birth_month),
    spouse_birth_year: toNumberInput(profile?.spouse_birth_year),
    spouse_birth_month: toNumberInput(profile?.spouse_birth_month),
  },
  children: children.map((child) => ({
    id: child.id,
    label: child.label,
    birth_year_month: toYearMonthInput(child.birth_year_month),
    due_year_month: toYearMonthInput(child.due_year_month),
    note: child.note ?? "",
  })),
});

export const buildIncomeSectionDefaults = (
  streams: Array<Tables<"income_streams">>,
): IncomeSectionInput => ({
  streams: streams.map((stream) => ({
    id: stream.id,
    label: stream.label,
    take_home_monthly: toNumberInput(stream.take_home_monthly),
    bonus_months: stream.bonus_months ?? [],
    bonus_amount: toNumberInput(stream.bonus_amount),
    change_year_month: toYearMonthInput(stream.change_year_month),
    bonus_amount_after: toNumberInput(stream.bonus_amount_after),
    raise_rate: toNumberInput(stream.raise_rate),
    start_year_month: toYearMonthInput(stream.start_year_month),
    end_year_month: toYearMonthInput(stream.end_year_month),
  })),
});

export const buildBonusSectionDefaults = (
  streams: Array<Tables<"income_streams">>,
): BonusSectionInput => ({
  streams: streams.map((stream) => ({
    id: stream.id,
    label: stream.label,
    bonus_months: stream.bonus_months ?? [],
    bonus_amount: toNumberInput(stream.bonus_amount),
    change_year_month: toYearMonthInput(stream.change_year_month),
    bonus_amount_after: toNumberInput(stream.bonus_amount_after),
  })),
});

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

export const toFamilyPayload = (
  value: FamilySectionPayload,
): {
  profile: {
    birth_year: number;
    birth_month: number;
    spouse_birth_year: number;
    spouse_birth_month: number;
  };
  children: CreateChildRequest[];
} => ({
  profile: {
    birth_year: value.profile.birth_year,
    birth_month: value.profile.birth_month,
    spouse_birth_year: value.profile.spouse_birth_year,
    spouse_birth_month: value.profile.spouse_birth_month,
  },
  children: value.children.map((child) => ({
    label: child.label,
    birth_year_month: child.birth_year_month ?? null,
    due_year_month: child.due_year_month ?? null,
    note: child.note ?? null,
  })),
});

export const toIncomeStreamPayloads = (value: IncomeSectionPayload): CreateIncomeStreamRequest[] =>
  value.streams.map((stream) => ({
    label: stream.label,
    take_home_monthly: stream.take_home_monthly,
    bonus_months: stream.bonus_months ?? [],
    bonus_amount: stream.bonus_amount,
    change_year_month: stream.change_year_month ?? null,
    bonus_amount_after: stream.bonus_amount_after ?? null,
    raise_rate: stream.raise_rate,
    start_year_month: stream.start_year_month,
    end_year_month: stream.end_year_month ?? null,
  }));

export const toExpensePayloads = (value: ExpenseSectionPayload): CreateExpenseRequest[] =>
  value.expenses.map((expense) => ({
    label: expense.label,
    amount_monthly: expense.amount_monthly,
    inflation_rate: expense.inflation_rate,
    category: expense.category,
    start_year_month: expense.start_year_month,
    end_year_month: expense.end_year_month ?? null,
  }));

export const toHousingPayloads = (
  value: HousingSectionPayload,
): {
  mortgages: CreateMortgageRequest[];
  rentals: CreateRentalRequest[];
} => ({
  mortgages: value.mortgages.map((mortgage) => ({
    principal: mortgage.principal,
    annual_rate: mortgage.annual_rate,
    years: mortgage.years,
    start_year_month: mortgage.start_year_month,
    building_price: mortgage.building_price,
    land_price: mortgage.land_price,
    down_payment: mortgage.down_payment,
    target_rental_id: mortgage.target_rental_id ?? null,
  })),
  rentals: value.rentals.map((rental) => ({
    rent_monthly: rental.rent_monthly,
    start_year_month: rental.start_year_month,
    end_year_month: rental.end_year_month ?? null,
  })),
});

export const toLifeEventPayloads = (value: LifeEventSectionPayload): CreateLifeEventRequest[] =>
  value.events.map((event) => ({
    label: event.label,
    amount: event.amount,
    year_month: event.year_month,
    repeat_interval_years: event.repeat_interval_years ?? null,
    stop_after_occurrences: event.stop_after_occurrences ?? null,
    category: event.category,
    auto_toggle_key: event.auto_toggle_key ?? null,
    building_price: event.building_price ?? null,
    land_price: event.land_price ?? null,
    down_payment: event.down_payment ?? null,
    target_rental_id: event.target_rental_id ?? null,
  }));

export const toRetirementPayload = (value: RetirementSectionPayload): CreateLifeEventRequest => ({
  label: value.label,
  amount: value.amount,
  year_month: value.year_month,
  repeat_interval_years: null,
  stop_after_occurrences: null,
  category: "retirement_bonus",
  auto_toggle_key: null,
  building_price: null,
  land_price: null,
  down_payment: null,
  target_rental_id: null,
});

export const toAssetPayload = (value: AssetSectionPayload): CreateAssetRequest => ({
  cash_balance: value.cash_balance,
  investment_balance: value.investment_balance,
  return_rate: value.return_rate,
});
