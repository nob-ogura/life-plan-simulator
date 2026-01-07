import { YearMonth } from "@/shared/domain/value-objects/YearMonth";

export const toYearMonthInput = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const yearMonth = YearMonth.tryCreate(value.slice(0, 7));
  return yearMonth ? yearMonth.toString() : value.slice(0, 7);
};

export const toMonthStartDate = (value: string) => {
  return YearMonth.toMonthStartDateFromInput(value);
};

export const toOptionalMonthStartDate = (value?: string | null) =>
  value ? toMonthStartDate(value) : null;
