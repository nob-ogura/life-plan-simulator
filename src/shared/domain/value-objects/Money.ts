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

  add(other: Money): Money {
    return new Money(this.value + other.value);
  }

  minus(other: Money): Money {
    return new Money(this.value - other.value);
  }
}
