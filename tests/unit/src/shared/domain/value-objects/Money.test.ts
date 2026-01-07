import { describe, expect, it } from "vitest";

import { Money } from "@/shared/domain/value-objects/Money";

describe("Money", () => {
  it("creates from a number and converts back", () => {
    const money = Money.of(1000);
    expect(money.toNumber()).toBe(1000);
  });

  it("adds values", () => {
    const result = Money.of(1200).add(Money.of(300));
    expect(result.toNumber()).toBe(1500);
  });

  it("subtracts values", () => {
    const result = Money.of(1200).minus(Money.of(300));
    expect(result.toNumber()).toBe(900);
  });

  it("formats with ja-JP locale", () => {
    const money = Money.of(1234567);
    expect(money.format()).toContain("1,234,567");
  });

  it("throws for non-finite values", () => {
    expect(() => Money.of(Number.NaN)).toThrow();
    expect(() => Money.of(Number.POSITIVE_INFINITY)).toThrow();
  });
});
