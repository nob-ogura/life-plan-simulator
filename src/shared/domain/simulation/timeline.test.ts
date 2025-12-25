import { describe, expect, it } from "vitest";
import {
  addMonths,
  elapsedMonthsToYearMonth,
  generateMonthlyTimeline,
  yearMonthToElapsedMonths,
} from "@/shared/domain/simulation";

describe("year-month utilities", () => {
  it("round-trips year-month values through elapsed months", () => {
    const samples = ["1990-01", "1990-12", "2025-06", "2030-11"];

    for (const sample of samples) {
      expect(elapsedMonthsToYearMonth(yearMonthToElapsedMonths(sample))).toBe(sample);
    }
  });

  it("adds months without relying on Date", () => {
    expect(addMonths("2025-01", 1)).toBe("2025-02");
    expect(addMonths("2025-01", 12)).toBe("2026-01");
    expect(addMonths("2025-01", -1)).toBe("2024-12");
  });
});

describe("generateMonthlyTimeline", () => {
  it("starts from current + offset and ends at the month reaching end age", () => {
    const timeline = generateMonthlyTimeline({
      currentYearMonth: "2025-01",
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

    expect(timeline[0]).toEqual({
      yearMonth: "2025-02",
      age: 34,
      spouseAge: null,
    });

    const last = timeline[timeline.length - 1];

    expect(last).toEqual({
      yearMonth: "2026-06",
      age: 36,
      spouseAge: null,
    });

    const birthdayMonth = timeline.find((month) => month.yearMonth === "2025-06");
    expect(birthdayMonth?.age).toBe(35);
  });
});
