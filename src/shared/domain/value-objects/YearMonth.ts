const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const ISO_DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

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

const parseYearMonthInput = (value: string): ParsedYearMonth => {
  if (YEAR_MONTH_REGEX.test(value)) {
    return parseYearMonth(value);
  }
  if (ISO_DATE_REGEX.test(value)) {
    return parseYearMonth(value.slice(0, 7));
  }
  throw new Error(`Invalid year-month format: ${value}`);
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

  static tryCreate(value: string): YearMonth | null {
    try {
      return new YearMonth(parseYearMonth(value));
    } catch {
      return null;
    }
  }

  static fromISOString(value: string): YearMonth {
    return new YearMonth(parseYearMonthInput(value));
  }

  static tryFromISOString(value: string): YearMonth | null {
    try {
      return new YearMonth(parseYearMonthInput(value));
    } catch {
      return null;
    }
  }

  static fromDate(date: Date): YearMonth {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
      throw new Error("Invalid Date instance");
    }
    return YearMonth.fromParts(date.getFullYear(), date.getMonth() + 1);
  }

  static now(): YearMonth {
    return YearMonth.fromDate(new Date());
  }

  static fromParts(year: number, month: number): YearMonth {
    if (!Number.isFinite(year) || !Number.isInteger(year)) {
      throw new Error(`Year must be an integer: ${year}`);
    }
    if (!Number.isFinite(month) || !Number.isInteger(month)) {
      throw new Error(`Month must be an integer: ${month}`);
    }

    const yearText = String(year).padStart(4, "0");
    const monthText = String(month).padStart(2, "0");
    return new YearMonth(parseYearMonth(`${yearText}-${monthText}`));
  }

  static tryFromParts(year: number, month: number): YearMonth | null {
    try {
      return YearMonth.fromParts(year, month);
    } catch {
      return null;
    }
  }

  static fromElapsedMonths(elapsedMonths: number): YearMonth {
    return new YearMonth(fromElapsedMonths(elapsedMonths));
  }

  static min(...values: YearMonth[]): YearMonth {
    const [first, ...rest] = values;
    if (!first) {
      throw new Error("YearMonth.min requires at least one value.");
    }
    return rest.reduce(
      (currentMin, value) => (value.isBefore(currentMin) ? value : currentMin),
      first,
    );
  }

  static validate(value: string): boolean {
    try {
      parseYearMonth(value);
      return true;
    } catch {
      return false;
    }
  }

  static toYearMonthStringFromInput(value: string): string {
    const yearMonth = YearMonth.tryFromISOString(value);
    return yearMonth ? yearMonth.toString() : value.slice(0, 7);
  }

  static formatJapaneseFromInput(value: string): string {
    const normalized = YearMonth.toYearMonthStringFromInput(value);
    if (YearMonth.validate(normalized)) {
      return YearMonth.create(normalized).toJapanese();
    }
    const [year, month] = normalized.split("-");
    if (!year || !month) {
      return value;
    }
    return `${year}\u5e74${month}\u6708`;
  }

  static formatJapaneseFromParts(year: number, month: number): string {
    const yearMonth = YearMonth.tryFromParts(year, month);
    if (yearMonth) {
      return yearMonth.toJapanese();
    }
    const yearText = String(year).padStart(4, "0");
    const monthText = String(month).padStart(2, "0");
    return `${yearText}\u5e74${monthText}\u6708`;
  }

  static toMonthStartDateFromInput(value: string): string {
    if (value.length !== 7) {
      return value;
    }
    if (YEAR_MONTH_REGEX.test(value)) {
      return YearMonth.create(value).toMonthStartDate();
    }
    return `${value}-01`;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }

  getYear(): number {
    return this.year;
  }

  getMonth(): number {
    return this.month;
  }

  toElapsedMonths(): number {
    return this.elapsedMonths;
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

  diffYears(other: YearMonth): number {
    return Math.trunc((this.elapsedMonths - other.elapsedMonths) / 12);
  }

  elapsedYearsSince(other: YearMonth): number {
    const diffMonths = this.elapsedMonths - other.elapsedMonths;
    if (diffMonths <= 0) {
      return 0;
    }
    return Math.floor(diffMonths / 12);
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
