const assertFiniteNumber = (value: number): void => {
  if (!Number.isFinite(value)) {
    throw new Error(`Money value must be a finite number: ${value}`);
  }
};

const formatter = new Intl.NumberFormat("ja-JP");

export type MoneyRoundingMode = "round" | "floor" | "ceil" | "trunc";

const roundValue = (value: number, mode: MoneyRoundingMode): number => {
  switch (mode) {
    case "floor":
      return Math.floor(value);
    case "ceil":
      return Math.ceil(value);
    case "trunc":
      return Math.trunc(value);
    default:
      return Math.round(value);
  }
};

export class Money {
  private readonly value: number;

  private constructor(value: number) {
    assertFiniteNumber(value);
    this.value = value;
  }

  static of(value: number): Money {
    return new Money(value);
  }

  static fromFloat(value: number, mode: MoneyRoundingMode = "round"): Money {
    assertFiniteNumber(value);
    return new Money(roundValue(value, mode));
  }

  toNumber(): number {
    return this.value;
  }

  toRoundedNumber(mode: MoneyRoundingMode = "round"): number {
    return roundValue(this.value, mode);
  }

  format(): string {
    return formatter.format(this.value);
  }

  formatYen(options?: { rounding?: MoneyRoundingMode }): string {
    const rounding = options?.rounding ?? "round";
    return `${formatter.format(this.toRoundedNumber(rounding))}円`;
  }

  isNegative(): boolean {
    return this.value < 0;
  }

  abs(): Money {
    return new Money(Math.abs(this.value));
  }

  add(other: Money): Money {
    return new Money(this.value + other.value);
  }

  minus(other: Money): Money {
    return new Money(this.value - other.value);
  }

  multiply(factor: number): Money {
    assertFiniteNumber(factor);
    return new Money(this.value * factor);
  }

  multiplyAndRound(factor: number, mode: MoneyRoundingMode): Money {
    assertFiniteNumber(factor);
    return Money.fromFloat(this.value * factor, mode);
  }

  divideAndRound(divisor: number, mode: MoneyRoundingMode): Money {
    assertFiniteNumber(divisor);
    if (divisor === 0) {
      throw new Error("Money divisor must not be zero.");
    }
    return Money.fromFloat(this.value / divisor, mode);
  }
}
