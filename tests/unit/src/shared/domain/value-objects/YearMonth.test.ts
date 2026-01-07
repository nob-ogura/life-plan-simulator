import { describe, expect, it } from "vitest";

import { YearMonth } from "@/shared/domain/value-objects/YearMonth";

describe("YearMonth", () => {
  it("creates from a valid YYYY-MM", () => {
    const value = YearMonth.create("2025-01");
    expect(value.toString()).toBe("2025-01");
  });

  it("creates from year and month parts", () => {
    const value = YearMonth.fromParts(2025, 2);
    expect(value.toString()).toBe("2025-02");
  });

  it("throws for an invalid month", () => {
    expect(() => YearMonth.create("2025-13")).toThrow();
  });

  it("returns null for invalid input with tryCreate", () => {
    expect(YearMonth.tryCreate("2025-13")).toBeNull();
    expect(YearMonth.tryCreate("2025-01")?.toString()).toBe("2025-01");
  });

  it("formats month start date", () => {
    const value = YearMonth.create("2024-12");
    expect(value.toMonthStartDate()).toBe("2024-12-01");
  });

  it("formats month start date from input", () => {
    expect(YearMonth.toMonthStartDateFromInput("2025-01")).toBe("2025-01-01");
    expect(YearMonth.toMonthStartDateFromInput("2025-13")).toBe("2025-13-01");
    expect(YearMonth.toMonthStartDateFromInput("2025-01-15")).toBe("2025-01-15");
  });

  it("formats Japanese display", () => {
    const value = YearMonth.create("2025-06");
    expect(value.toJapanese()).toBe("2025\u5e7406\u6708");
  });

  it("compares and adds months", () => {
    const base = YearMonth.create("2025-01");
    const same = YearMonth.create("2025-01");
    const later = YearMonth.create("2025-03");

    expect(base.equals(same)).toBe(true);
    expect(base.equals(later)).toBe(false);
    expect(base.isBefore(later)).toBe(true);
    expect(later.isAfter(base)).toBe(true);
    expect(base.addMonths(1).toString()).toBe("2025-02");
    expect(base.addMonths(12).toString()).toBe("2026-01");
    expect(base.addMonths(-1).toString()).toBe("2024-12");
  });

  it("serializes to JSON as YYYY-MM", () => {
    const value = YearMonth.create("2023-07");
    expect(JSON.stringify(value)).toBe('"2023-07"');
    expect(JSON.stringify({ value })).toContain("2023-07");
  });
});
