const assertFiniteNumber = (value: number): void => {
  if (!Number.isFinite(value)) {
    throw new Error(`Money value must be a finite number: ${value}`);
  }
};

const formatter = new Intl.NumberFormat("ja-JP");

export class Money {
  private readonly value: number;

  private constructor(value: number) {
    assertFiniteNumber(value);
    this.value = value;
  }

  static of(value: number): Money {
    return new Money(value);
  }

  toNumber(): number {
    return this.value;
  }

  format(): string {
    return formatter.format(this.value);
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
}
