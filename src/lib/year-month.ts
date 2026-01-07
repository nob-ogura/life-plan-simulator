import { YearMonth } from "@/shared/domain/value-objects/YearMonth";

const tryCreateYearMonth = (value: string): YearMonth | null => {
  const normalized = value.slice(0, 7);
  try {
    return YearMonth.create(normalized);
  } catch {
    return null;
  }
};

export const toYearMonth = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }
  const yearMonth = tryCreateYearMonth(value);
  return yearMonth ? yearMonth.toString() : value.slice(0, 7);
};

export const toRequiredYearMonth = (value: string): string => {
  const yearMonth = tryCreateYearMonth(value);
  return yearMonth ? yearMonth.toString() : value.slice(0, 7);
};

export const toMonthStartDate = (value: string): string => {
  if (value.length !== 7) {
    return value;
  }
  const yearMonth = tryCreateYearMonth(value);
  return yearMonth ? yearMonth.toMonthStartDate() : `${value}-01`;
};

export const getCurrentYearMonth = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const value = `${year}-${String(month).padStart(2, "0")}`;
  return YearMonth.create(value).toString();
};
