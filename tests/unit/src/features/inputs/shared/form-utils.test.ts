import { describe, expect, it } from "vitest";

import { optionalYearMonth, requiredYearMonth } from "@/features/inputs/shared/form-utils";

describe("form-utils YearMonth schemas", () => {
  it("accepts valid required year-month", () => {
    const result = requiredYearMonth.safeParse("2025-02");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("2025-02");
    }
  });

  it("rejects invalid required year-month", () => {
    const result = requiredYearMonth.safeParse("2025-00");
    expect(result.success).toBe(false);
  });

  it("accepts optional year-month values", () => {
    expect(optionalYearMonth.parse(undefined)).toBeUndefined();
    expect(optionalYearMonth.parse("")).toBeUndefined();
    expect(optionalYearMonth.parse("2025-12")).toBe("2025-12");
  });

  it("rejects invalid optional year-month", () => {
    const result = optionalYearMonth.safeParse("2025-13");
    expect(result.success).toBe(false);
  });
});
