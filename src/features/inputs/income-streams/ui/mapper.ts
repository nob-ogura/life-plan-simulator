import type { CreateIncomeStreamRequest } from "@/features/inputs/income-streams/commands/create-income-stream/request";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import type { Tables } from "@/types/supabase";

import type { BonusSectionInput } from "./bonus-schema";
import type { IncomeSectionInput, IncomeSectionPayload } from "./schema";

const toNumberInput = (value?: number | null) => (value == null ? "" : String(value));

export const buildIncomeSectionDefaults = (
  streams: Array<Tables<"income_streams">>,
): IncomeSectionInput => ({
  streams: streams.map((stream) => ({
    id: stream.id,
    label: stream.label,
    take_home_monthly: toNumberInput(stream.take_home_monthly),
    raise_rate: toNumberInput(stream.raise_rate),
    start_year_month: stream.start_year_month
      ? YearMonth.toYearMonthStringFromInput(stream.start_year_month)
      : "",
    end_year_month: stream.end_year_month
      ? YearMonth.toYearMonthStringFromInput(stream.end_year_month)
      : "",
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
    change_year_month: stream.change_year_month
      ? YearMonth.toYearMonthStringFromInput(stream.change_year_month)
      : "",
    bonus_amount_after: toNumberInput(stream.bonus_amount_after),
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
    start_year_month: YearMonth.toMonthStartDateFromInput(stream.start_year_month),
    end_year_month: stream.end_year_month
      ? YearMonth.toMonthStartDateFromInput(stream.end_year_month)
      : null,
  }));

export const toIncomeStreamUpdatePayloads = (
  value: IncomeSectionPayload,
): UpdateIncomeStreamRequest[] =>
  value.streams.map((stream) => ({
    label: stream.label,
    take_home_monthly: stream.take_home_monthly,
    raise_rate: stream.raise_rate,
    start_year_month: YearMonth.toMonthStartDateFromInput(stream.start_year_month),
    end_year_month: stream.end_year_month
      ? YearMonth.toMonthStartDateFromInput(stream.end_year_month)
      : null,
  }));
