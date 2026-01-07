import { YearMonth } from "@/shared/domain/value-objects/YearMonth";

export const toYearMonth = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }
  return YearMonth.toYearMonthStringFromInput(value);
};

export const toRequiredYearMonth = (value: string): string => {
  return YearMonth.toYearMonthStringFromInput(value);
};

export const toMonthStartDate = (value: string): string => {
  return YearMonth.toMonthStartDateFromInput(value);
};

export const getCurrentYearMonth = (date: Date = new Date()): string => {
  return YearMonth.fromDate(date).toString();
};
