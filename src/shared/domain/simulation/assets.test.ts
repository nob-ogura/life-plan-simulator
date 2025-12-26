import { describe, expect, it } from "vitest";
import { type SimulationInput, simulateLifePlan } from "@/shared/domain/simulation";

const createBaseInput = (): SimulationInput => ({
  currentYearMonth: "2025-01",
  profiles: {
    birth_year: 1990,
    birth_month: 1,
    spouse_birth_year: null,
    spouse_birth_month: null,
    pension_start_age: 65,
  },
  simulationSettings: {
    start_offset_months: 0,
    end_age: 36,
    pension_amount_single: 0,
    pension_amount_spouse: 0,
    mortgage_transaction_cost_rate: 1,
    real_estate_tax_rate: 0.01,
    real_estate_evaluation_rate: 0.7,
  },
  children: [],
  incomeStreams: [],
  expenses: [],
  rentals: [],
  assets: [],
  mortgages: [],
  lifeEvents: [],
});

const getMonth = (input: SimulationInput, yearMonth: string) => {
  const result = simulateLifePlan(input);
  const month = result.months.find((entry) => entry.yearMonth === yearMonth);
  if (!month) {
    throw new Error(`Missing month ${yearMonth}`);
  }
  return month;
};

describe("asset balances", () => {
  it("moves cash flow into cash, covers deficits from investment, and applies return only to investment", () => {
    const input = createBaseInput();
    input.assets = [{ cash_balance: 100, investment_balance: 1000, return_rate: 0.12 }];
    input.expenses = [
      {
        amount_monthly: 200,
        inflation_rate: 0,
        category: "living",
        start_year_month: "2025-02",
        end_year_month: null,
      },
    ];

    const month1 = getMonth(input, "2025-01");
    const month2 = getMonth(input, "2025-02");

    expect(month1.cashBalance).toBeCloseTo(100);
    expect(month1.investmentBalance).toBeCloseTo(1010);
    expect(month1.totalBalance).toBeCloseTo(1110);

    expect(month2.cashBalance).toBeCloseTo(0);
    expect(month2.investmentBalance).toBeCloseTo(919.1);
    expect(month2.totalBalance).toBeCloseTo(919.1);
  });

  it("records the first month where total balance is negative as depletion month", () => {
    const input = createBaseInput();
    input.assets = [{ cash_balance: 0, investment_balance: 50, return_rate: 0 }];
    input.expenses = [
      {
        amount_monthly: 100,
        inflation_rate: 0,
        category: "living",
        start_year_month: "2025-02",
        end_year_month: null,
      },
    ];

    const result = simulateLifePlan(input);
    expect(result.depletionYearMonth).toBe("2025-02");
    expect(getMonth(input, "2025-01").totalBalance).toBeCloseTo(50);
    expect(getMonth(input, "2025-02").totalBalance).toBeLessThan(0);
  });
});
