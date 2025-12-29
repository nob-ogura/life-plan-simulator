export const toYearMonth = (value?: string | null): string | null =>
  value ? value.slice(0, 7) : null;

export const toRequiredYearMonth = (value: string): string => value.slice(0, 7);

export const toMonthStartDate = (value: string): string =>
  value.length === 7 ? `${value}-01` : value;

export const getCurrentYearMonth = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
};
