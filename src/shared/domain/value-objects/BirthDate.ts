import type { YearMonth } from "@/shared/domain/value-objects/YearMonth";

export class BirthDate {
  private readonly year: number;
  private readonly month: number;

  private constructor(year: number, month: number) {
    if (month < 1 || month > 12) {
      throw new Error("Birth month must be between 1 and 12.");
    }
    this.year = year;
    this.month = month;
  }

  static fromYearMonth(year: number, month: number): BirthDate {
    return new BirthDate(year, month);
  }

  ageAt(target: YearMonth): number {
    const targetYear = target.getYear();
    const targetMonth = target.getMonth();
    const hasBirthdayPassed = targetMonth >= this.month;
    return targetYear - this.year - (hasBirthdayPassed ? 0 : 1);
  }
}
