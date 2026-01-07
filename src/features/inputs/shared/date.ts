import { YearMonth } from "@/shared/domain/value-objects/YearMonth";

const tryCreateYearMonth = (value: string): YearMonth | null => {
  const normalized = value.slice(0, 7);
  try {
    return YearMonth.create(normalized);
  } catch {
    return null;
  }
};

export const toYearMonthInput = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const yearMonth = tryCreateYearMonth(value);
  return yearMonth ? yearMonth.toString() : value.slice(0, 7);
};

export const toMonthStartDate = (value: string) => {
  if (value.length !== 7) {
    return value;
  }
  const yearMonth = tryCreateYearMonth(value);
  return yearMonth ? yearMonth.toMonthStartDate() : `${value}-01`;
};

export const toOptionalMonthStartDate = (value?: string | null) =>
  value ? toMonthStartDate(value) : null;
