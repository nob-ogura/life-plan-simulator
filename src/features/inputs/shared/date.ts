import { YearMonth } from "@/shared/domain/value-objects/YearMonth";

export const toYearMonthInput = (value?: string | null) => {
  if (!value) {
    return "";
  }
  return YearMonth.toYearMonthStringFromInput(value);
};

export const toMonthStartDate = (value: string) => {
  return YearMonth.toMonthStartDateFromInput(value);
};

export const toOptionalMonthStartDate = (value?: string | null) =>
  value ? toMonthStartDate(value) : null;
