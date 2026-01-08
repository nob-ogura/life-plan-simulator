import { describe, expect, it } from "vitest";
import { generateMonthlyTimeline } from "@/shared/domain/simulation";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";

describe("year-month utilities", () => {
  it("round-trips year-month values through elapsed months", () => {
    const samples = ["1990-01", "1990-12", "2025-06", "2030-11"];

    for (const sample of samples) {
      const yearMonth = YearMonth.create(sample);
      expect(YearMonth.fromElapsedMonths(yearMonth.toElapsedMonths()).toString()).toBe(sample);
    }
  });

  it("adds months without relying on Date", () => {
    const base = YearMonth.create("2025-01");
    expect(base.addMonths(1).toString()).toBe("2025-02");
    expect(base.addMonths(12).toString()).toBe("2026-01");
    expect(base.addMonths(-1).toString()).toBe("2024-12");
  });
});

describe("generateMonthlyTimeline", () => {
  it("starts from current + offset and ends at the month reaching end age", () => {
    const timeline = generateMonthlyTimeline({
      currentYearMonth: YearMonth.create("2025-01"),
      startOffsetMonths: 1,
      endAge: 36,
      profile: {
        birth_year: 1990,
        birth_month: 6,
        spouse_birth_year: null,
        spouse_birth_month: null,
        pension_start_age: 65,
      },
    });

    expect(timeline[0]?.yearMonth.toString()).toBe("2025-02");
    expect(timeline[0]?.age).toBe(34);
    expect(timeline[0]?.spouseAge).toBeNull();

    const last = timeline[timeline.length - 1];

    expect(last?.yearMonth.toString()).toBe("2026-06");
    expect(last?.age).toBe(36);
    expect(last?.spouseAge).toBeNull();

    const birthdayMonth = timeline.find((month) => month.yearMonth.toString() === "2025-06");
    expect(birthdayMonth?.age).toBe(35);
  });
});
