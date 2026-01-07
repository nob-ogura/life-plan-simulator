import { YearMonth } from "@/shared/domain/value-objects/YearMonth";

export const toYearMonth = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }
  const yearMonth = YearMonth.tryCreate(value.slice(0, 7));
  return yearMonth ? yearMonth.toString() : value.slice(0, 7);
};

export const toRequiredYearMonth = (value: string): string => {
  const yearMonth = YearMonth.tryCreate(value.slice(0, 7));
  return yearMonth ? yearMonth.toString() : value.slice(0, 7);
};

export const toMonthStartDate = (value: string): string => {
  return YearMonth.toMonthStartDateFromInput(value);
};

export const getCurrentYearMonth = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const value = `${year}-${String(month).padStart(2, "0")}`;
  return YearMonth.create(value).toString();
};
