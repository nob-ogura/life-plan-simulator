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
    end_age: 70,
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

describe("expense calculation", () => {
  it("applies inflation annually and counts only within the active period", () => {
    const input = createBaseInput();
    input.expenses = [
      {
        amount_monthly: 100000,
        inflation_rate: 0.1,
        category: "living",
        start_year_month: "2025-01",
        end_year_month: "2026-12",
      },
    ];

    expect(getMonth(input, "2025-12").totalExpense).toBeCloseTo(100000);
    expect(getMonth(input, "2026-01").totalExpense).toBeCloseTo(110000);
    expect(getMonth(input, "2027-01").totalExpense).toBe(0);
  });

  it("stops rent in the month before housing purchase", () => {
    const input = createBaseInput();
    input.rentals = [
      {
        id: "rental-1",
        rent_monthly: 80000,
        start_year_month: "2025-01",
        end_year_month: null,
      },
    ];
    input.lifeEvents = [
      {
        amount: 0,
        year_month: "2025-04",
        repeat_interval_years: null,
        stop_after_occurrences: null,
        category: "housing_purchase",
        auto_toggle_key: "HOUSING_PURCHASE_STOP_RENT",
        building_price: 0,
        land_price: 0,
        down_payment: 0,
        target_rental_id: "rental-1",
      },
    ];

    expect(getMonth(input, "2025-03").totalExpense).toBe(80000);
    expect(getMonth(input, "2025-04").totalExpense).toBe(0);
  });
});
