export const toYearMonthInput = (value?: string | null) => (value ? value.slice(0, 7) : "");

export const toMonthStartDate = (value: string) => (value.length === 7 ? `${value}-01` : value);

export const toOptionalMonthStartDate = (value?: string | null) =>
  value ? toMonthStartDate(value) : null;
