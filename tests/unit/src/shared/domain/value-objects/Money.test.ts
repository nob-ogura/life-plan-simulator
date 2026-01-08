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

  it("multiplies and rounds with explicit mode", () => {
    const base = Money.of(10);
    expect(base.multiplyAndRound(2.55, "round").toNumber()).toBe(26);
    expect(base.multiplyAndRound(2.55, "floor").toNumber()).toBe(25);
    expect(base.multiplyAndRound(2.55, "ceil").toNumber()).toBe(26);
    expect(base.multiplyAndRound(2.55, "trunc").toNumber()).toBe(25);
  });

  it("divides and rounds with explicit mode", () => {
    const base = Money.of(10);
    expect(base.divideAndRound(4, "round").toNumber()).toBe(3);
    expect(base.divideAndRound(4, "floor").toNumber()).toBe(2);
    expect(base.divideAndRound(4, "ceil").toNumber()).toBe(3);
    expect(base.divideAndRound(4, "trunc").toNumber()).toBe(2);
  });

  it("throws when dividing by zero or non-finite values", () => {
    const base = Money.of(10);
    expect(() => base.divideAndRound(0, "round")).toThrow();
    expect(() => base.divideAndRound(Number.NaN, "round")).toThrow();
    expect(() => base.divideAndRound(Number.POSITIVE_INFINITY, "round")).toThrow();
  });

  it("throws when multiplying by non-finite values", () => {
    const base = Money.of(10);
    expect(() => base.multiplyAndRound(Number.NaN, "round")).toThrow();
    expect(() => base.multiplyAndRound(Number.POSITIVE_INFINITY, "round")).toThrow();
  });
});
