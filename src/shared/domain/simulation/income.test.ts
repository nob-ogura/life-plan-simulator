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

describe("income calculation", () => {
  it("counts income only within the active period", () => {
    const input = createBaseInput();
    input.incomeStreams = [
      {
        take_home_monthly: 100000,
        bonus_months: [],
        bonus_amount: 0,
        change_year_month: null,
        bonus_amount_after: null,
        raise_rate: 0,
        start_year_month: "2025-03",
        end_year_month: "2025-05",
      },
    ];

    expect(getMonth(input, "2025-02").totalIncome).toBe(0);
    expect(getMonth(input, "2025-03").totalIncome).toBe(100000);
    expect(getMonth(input, "2025-06").totalIncome).toBe(0);
  });

  it("applies raise rate annually and switches bonus after change month", () => {
    const input = createBaseInput();
    input.incomeStreams = [
      {
        take_home_monthly: 10000,
        bonus_months: [6],
        bonus_amount: 1000,
        change_year_month: "2026-01",
        bonus_amount_after: 2000,
        raise_rate: 0.1,
        start_year_month: "2025-01",
        end_year_month: null,
      },
    ];

    expect(getMonth(input, "2025-01").totalIncome).toBeCloseTo(10000);
    expect(getMonth(input, "2025-06").totalIncome).toBeCloseTo(11000);
    expect(getMonth(input, "2026-01").totalIncome).toBeCloseTo(11000);
    expect(getMonth(input, "2026-06").totalIncome).toBeCloseTo(13000);
  });

  it("adds pension income after pension start age and retirement bonus once", () => {
    const input = createBaseInput();
    input.profiles = {
      birth_year: 1960,
      birth_month: 1,
      spouse_birth_year: 1962,
      spouse_birth_month: 1,
      pension_start_age: 65,
    };
    input.simulationSettings = {
      ...input.simulationSettings,
      pension_amount_single: 100000,
      pension_amount_spouse: 50000,
    };
    input.lifeEvents = [
      {
        amount: 300000,
        year_month: "2025-03",
        repeat_interval_years: null,
        stop_after_occurrences: null,
        category: "retirement_bonus",
        auto_toggle_key: null,
        building_price: null,
        land_price: null,
        down_payment: null,
      },
    ];

    expect(getMonth(input, "2025-01").totalIncome).toBe(100000);
    expect(getMonth(input, "2025-03").totalIncome).toBe(400000);
    expect(getMonth(input, "2025-04").totalIncome).toBe(100000);
    expect(getMonth(input, "2027-01").totalIncome).toBe(150000);
  });
});
