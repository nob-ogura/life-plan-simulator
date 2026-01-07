import type { UpsertRetirementBonusRequest } from "@/features/inputs/life-events/commands/upsert-retirement-bonus/request";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import type { Tables } from "@/types/supabase";

import type { RetirementSectionInput, RetirementSectionPayload } from "./schema";

const toNumberInput = (value?: number | null) => (value == null ? "" : String(value));

export const buildRetirementSectionDefaults = (
  events: Array<Tables<"life_events">>,
): RetirementSectionInput => {
  const retirement = [...events]
    .filter((event) => event.category === "retirement_bonus")
    .sort((left, right) => (right.year_month ?? "").localeCompare(left.year_month ?? ""))[0];
  const retirementYearMonth = retirement?.year_month ?? null;

  return {
    label: retirement?.label ?? "退職金",
    amount: toNumberInput(retirement?.amount),
    year_month: retirementYearMonth
      ? YearMonth.toYearMonthStringFromInput(retirementYearMonth)
      : "",
  };
};

export const toRetirementPayload = (
  value: RetirementSectionPayload,
): UpsertRetirementBonusRequest => ({
  label: value.label,
  amount: value.amount,
  year_month: YearMonth.toMonthStartDateFromInput(value.year_month),
  repeat_interval_years: null,
  stop_after_age: null,
  stop_after_occurrences: null,
  category: "retirement_bonus",
  auto_toggle_key: null,
  building_price: null,
  land_price: null,
  down_payment: null,
});
