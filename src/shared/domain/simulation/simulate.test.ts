import { describe, expect, it } from "vitest";
import { type SimulationInput, simulateLifePlan } from "@/shared/domain/simulation";

const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === "object") {
    Object.freeze(value);
    if (Array.isArray(value)) {
      for (const entry of value) {
        deepFreeze(entry);
      }
    } else {
      for (const entry of Object.values(value as Record<string, unknown>)) {
        deepFreeze(entry);
      }
    }
  }
  return value;
};

const createInput = (): SimulationInput => ({
  currentYearMonth: "2025-01",
  profiles: {
    birth_year: 1990,
    birth_month: 1,
    spouse_birth_year: 1992,
    spouse_birth_month: 6,
    pension_start_age: 65,
  },
  simulationSettings: {
    start_offset_months: 0,
    end_age: 100,
    pension_amount_single: 65000,
    pension_amount_spouse: 130000,
    mortgage_transaction_cost_rate: 1.03,
    real_estate_tax_rate: 0.014,
    real_estate_evaluation_rate: 0.7,
  },
  children: [{ birth_year_month: "2020-05", due_year_month: null }],
  incomeStreams: [
    {
      take_home_monthly: 300000,
      bonus_months: [6, 12],
      bonus_amount: 500000,
      change_year_month: "2030-01",
      bonus_amount_after: 600000,
      raise_rate: 0.02,
      start_year_month: "2020-01",
      end_year_month: null,
    },
  ],
  expenses: [
    {
      amount_monthly: 200000,
      inflation_rate: 0.01,
      category: "living",
      start_year_month: "2020-01",
      end_year_month: null,
    },
  ],
  rentals: [
    {
      id: "rental-1",
      rent_monthly: 100000,
      start_year_month: "2020-01",
      end_year_month: null,
    },
  ],
  assets: [{ cash_balance: 1000000, investment_balance: 5000000, return_rate: 0.03 }],
  mortgages: [
    {
      principal: 30000000,
      annual_rate: 0.015,
      years: 35,
      start_year_month: "2030-01",
      building_price: 20000000,
      land_price: 10000000,
      down_payment: 5000000,
    },
  ],
  lifeEvents: [
    {
      amount: 1000000,
      year_month: "2030-01",
      repeat_interval_years: null,
      stop_after_age: null,
      stop_after_occurrences: null,
      category: "housing_purchase",
      auto_toggle_key: "HOUSING_PURCHASE_STOP_RENT",
      building_price: 20000000,
      land_price: 10000000,
      down_payment: 5000000,
    },
  ],
});

describe("simulateLifePlan", () => {
  it("does not mutate the input and returns a stable shape", () => {
    const input = createInput();
    const snapshot = JSON.parse(JSON.stringify(input)) as SimulationInput;
    const frozen = deepFreeze(input);

    expect(() => simulateLifePlan(frozen)).not.toThrow();

    const result = simulateLifePlan(frozen);

    expect(frozen).toEqual(snapshot);
    expect(Array.isArray(result.months)).toBe(true);
    expect(
      result.depletionYearMonth === null || typeof result.depletionYearMonth === "string",
    ).toBe(true);
  });
});
