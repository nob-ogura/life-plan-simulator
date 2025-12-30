import { z } from "zod";
import type { CreateChildRequest } from "@/features/inputs/children/commands/create-child/request";
import type { CreateExpenseRequest } from "@/features/inputs/expenses/commands/create-expense/request";
import type { CreateIncomeStreamRequest } from "@/features/inputs/income-streams/commands/create-income-stream/request";
import type { CreateLifeEventRequest } from "@/features/inputs/life-events/commands/create-life-event/request";
import type { UpsertRetirementBonusRequest } from "@/features/inputs/life-events/commands/upsert-retirement-bonus/request";
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

const IncomeStreamBaseSchema = z.object({
  id: z.string().optional(),
  label: requiredString,
  take_home_monthly: requiredNumericString,
  raise_rate: optionalNumericString,
  start_year_month: requiredYearMonth,
  end_year_month: optionalYearMonth,
});

const BonusStreamSchema = z.object({
  id: z.string().optional(),
  label: requiredString,
  bonus_months: bonusMonthsSchema,
  bonus_amount: requiredNumericString,
  change_year_month: optionalYearMonth,
  bonus_amount_after: optionalNumericString,
});

export const IncomeSectionSchema = z.object({
  streams: arrayWithDefault(IncomeStreamBaseSchema),
});

export type IncomeSectionInput = z.input<typeof IncomeSectionSchema>;
export type IncomeSectionPayload = z.output<typeof IncomeSectionSchema>;

export const BonusSectionSchema = z.object({
  streams: arrayWithDefault(BonusStreamSchema),
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
export const toMonthStartDate = (value: string) => (value.length === 7 ? `${value}-01` : value);
export const toOptionalMonthStartDate = (value?: string | null) =>
  value ? toMonthStartDate(value) : null;
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

export const buildHousingSectionDefaults = (
  mortgages: Array<Tables<"mortgages">>,
  rentals: Array<Tables<"rentals">>,
): HousingSectionInput => ({
  mortgages: mortgages.map((mortgage) => ({
    id: mortgage.id,
    principal: toNumberInput(mortgage.principal),
    annual_rate: toNumberInput(mortgage.annual_rate),
    years: toNumberInput(mortgage.years),
    start_year_month: toYearMonthInput(mortgage.start_year_month),
    building_price: toNumberInput(mortgage.building_price),
    land_price: toNumberInput(mortgage.land_price),
    down_payment: toNumberInput(mortgage.down_payment),
    target_rental_id: mortgage.target_rental_id ?? "",
  })),
  rentals: rentals.map((rental) => ({
    id: rental.id,
    rent_monthly: toNumberInput(rental.rent_monthly),
    start_year_month: toYearMonthInput(rental.start_year_month),
    end_year_month: toYearMonthInput(rental.end_year_month),
  })),
});

export const buildPensionSectionDefaults = (
  profile: Tables<"profiles"> | null,
): PensionSectionInput => ({
  pension_start_age: toNumberInput(profile?.pension_start_age),
});

export const buildSimulationSectionDefaults = (
  settings: Tables<"simulation_settings"> | null,
): SimulationSectionInput => ({
  start_offset_months: toNumberInput(settings?.start_offset_months),
  end_age: toNumberInput(settings?.end_age),
  pension_amount_single: toNumberInput(settings?.pension_amount_single),
  pension_amount_spouse: toNumberInput(settings?.pension_amount_spouse),
  mortgage_transaction_cost_rate: toNumberInput(settings?.mortgage_transaction_cost_rate),
  real_estate_tax_rate: toNumberInput(settings?.real_estate_tax_rate),
  real_estate_evaluation_rate: toNumberInput(settings?.real_estate_evaluation_rate),
});

export const buildRetirementSectionDefaults = (
  events: Array<Tables<"life_events">>,
): RetirementSectionInput => {
  const retirement = [...events]
    .filter((event) => event.category === "retirement_bonus")
    .sort((left, right) => (right.year_month ?? "").localeCompare(left.year_month ?? ""))[0];

  return {
    label: retirement?.label ?? "退職金",
    amount: toNumberInput(retirement?.amount),
    year_month: toYearMonthInput(retirement?.year_month),
  };
};

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
    birth_year_month: toOptionalMonthStartDate(child.birth_year_month),
    due_year_month: toOptionalMonthStartDate(child.due_year_month),
    note: child.note ?? null,
  })),
});

export type UpdateIncomeStreamRequest = Pick<
  CreateIncomeStreamRequest,
  "label" | "take_home_monthly" | "raise_rate" | "start_year_month" | "end_year_month"
>;

export const toIncomeStreamCreatePayloads = (
  value: IncomeSectionPayload,
): CreateIncomeStreamRequest[] =>
  value.streams.map((stream) => ({
    label: stream.label,
    take_home_monthly: stream.take_home_monthly,
    bonus_months: [],
    bonus_amount: 0,
    change_year_month: null,
    bonus_amount_after: null,
    raise_rate: stream.raise_rate,
    start_year_month: toMonthStartDate(stream.start_year_month),
    end_year_month: toOptionalMonthStartDate(stream.end_year_month),
  }));

export const toIncomeStreamUpdatePayloads = (
  value: IncomeSectionPayload,
): UpdateIncomeStreamRequest[] =>
  value.streams.map((stream) => ({
    label: stream.label,
    take_home_monthly: stream.take_home_monthly,
    raise_rate: stream.raise_rate,
    start_year_month: toMonthStartDate(stream.start_year_month),
    end_year_month: toOptionalMonthStartDate(stream.end_year_month),
  }));

export const toExpensePayloads = (value: ExpenseSectionPayload): CreateExpenseRequest[] =>
  value.expenses.map((expense) => ({
    label: expense.label,
    amount_monthly: expense.amount_monthly,
    inflation_rate: expense.inflation_rate,
    category: expense.category,
    start_year_month: toMonthStartDate(expense.start_year_month),
    end_year_month: toOptionalMonthStartDate(expense.end_year_month),
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
    start_year_month: toMonthStartDate(mortgage.start_year_month),
    building_price: mortgage.building_price,
    land_price: mortgage.land_price,
    down_payment: mortgage.down_payment,
    target_rental_id: mortgage.target_rental_id ? mortgage.target_rental_id : null,
  })),
  rentals: value.rentals.map((rental) => ({
    rent_monthly: rental.rent_monthly,
    start_year_month: toMonthStartDate(rental.start_year_month),
    end_year_month: toOptionalMonthStartDate(rental.end_year_month),
  })),
});

export const toLifeEventPayloads = (value: LifeEventSectionPayload): CreateLifeEventRequest[] =>
  value.events.map((event) => ({
    label: event.label,
    amount: event.amount,
    year_month: toMonthStartDate(event.year_month),
    repeat_interval_years: event.repeat_interval_years ?? null,
    stop_after_occurrences: event.stop_after_occurrences ?? null,
    category: event.category,
    auto_toggle_key: event.auto_toggle_key ?? null,
    building_price: event.building_price ?? null,
    land_price: event.land_price ?? null,
    down_payment: event.down_payment ?? null,
    target_rental_id: event.target_rental_id ?? null,
  }));

export const toRetirementPayload = (
  value: RetirementSectionPayload,
): UpsertRetirementBonusRequest => ({
  label: value.label,
  amount: value.amount,
  year_month: toMonthStartDate(value.year_month),
  repeat_interval_years: null,
  stop_after_occurrences: null,
  category: "retirement_bonus",
  auto_toggle_key: null,
  building_price: null,
  land_price: null,
  down_payment: null,
  target_rental_id: null,
});
