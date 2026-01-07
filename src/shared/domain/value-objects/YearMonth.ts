const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

type ParsedYearMonth = {
  year: number;
  month: number;
  value: string;
};

const parseYearMonth = (value: string): ParsedYearMonth => {
  if (!YEAR_MONTH_REGEX.test(value)) {
    throw new Error(`Invalid year-month format: ${value}`);
  }

  const [yearText, monthText] = value.split("-");
  if (!yearText || !monthText) {
    throw new Error(`Invalid year-month format: ${value}`);
  }

  const year = Number.parseInt(yearText, 10);
  const month = Number.parseInt(monthText, 10);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    throw new Error(`Invalid year-month format: ${value}`);
  }

  return { year, month, value };
};

const toElapsedMonths = (year: number, month: number): number => year * 12 + (month - 1);

const fromElapsedMonths = (elapsedMonths: number): ParsedYearMonth => {
  if (!Number.isFinite(elapsedMonths) || !Number.isInteger(elapsedMonths)) {
    throw new Error(`Elapsed months must be an integer: ${elapsedMonths}`);
  }

  const year = Math.floor(elapsedMonths / 12);
  const monthIndex = elapsedMonths - year * 12;
  const month = monthIndex + 1;
  const yearText = String(year).padStart(4, "0");
  const monthText = String(month).padStart(2, "0");
  const value = `${yearText}-${monthText}`;

  return parseYearMonth(value);
};

export class YearMonth {
  private readonly value: string;
  private readonly year: number;
  private readonly month: number;
  private readonly elapsedMonths: number;

  private constructor(parsed: ParsedYearMonth) {
    this.value = parsed.value;
    this.year = parsed.year;
    this.month = parsed.month;
    this.elapsedMonths = toElapsedMonths(parsed.year, parsed.month);
  }

  static create(value: string): YearMonth {
    return new YearMonth(parseYearMonth(value));
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }

  toJapanese(): string {
    const [yearText, monthText] = this.value.split("-");
    return `${yearText}\u5e74${monthText}\u6708`;
  }

  toMonthStartDate(): string {
    return `${this.value}-01`;
  }

  equals(other: YearMonth): boolean {
    return this.value === other.value;
  }

  isBefore(other: YearMonth): boolean {
    return this.elapsedMonths < other.elapsedMonths;
  }

  isAfter(other: YearMonth): boolean {
    return this.elapsedMonths > other.elapsedMonths;
  }

  addMonths(months: number): YearMonth {
    if (!Number.isFinite(months) || !Number.isInteger(months)) {
      throw new Error(`Months must be an integer: ${months}`);
    }

    return new YearMonth(fromElapsedMonths(this.elapsedMonths + months));
  }
}
