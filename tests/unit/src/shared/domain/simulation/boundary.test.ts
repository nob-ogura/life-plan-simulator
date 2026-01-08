import { describe, expect, it } from "vitest";
import type { LifeEventCategory } from "@/shared/domain/life-events/categories";
import {
  deriveHousingPurchaseMetrics,
  type SimulationInputDomain,
  simulateLifePlan,
} from "@/shared/domain/simulation";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";

const travelCategory: LifeEventCategory = "travel";
const housingPurchaseCategory: LifeEventCategory = "housing_purchase";
const retirementBonusCategory: LifeEventCategory = "retirement_bonus";

const createBaseInput = (): SimulationInputDomain => ({
  currentYearMonth: YearMonth.create("2025-01"),
  profiles: {
    birth_year: 1990,
    birth_month: 1,
    spouse_birth_year: null,
    spouse_birth_month: null,
    pension_start_age: 65,
  },
  simulationSettings: {
    start_offset_months: 0,
    end_age: 100,
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

const getMonth = (input: SimulationInputDomain, yearMonth: string) => {
  const result = simulateLifePlan(input);
  const month = result.months.find((entry) => entry.yearMonth.toString() === yearMonth);
  if (!month) {
    throw new Error(`Missing month ${yearMonth}`);
  }
  return {
    ...month,
    totalIncome: month.totalIncome.toNumber(),
    totalExpense: month.totalExpense.toNumber(),
    eventAmount: month.eventAmount.toNumber(),
    netCashflow: month.netCashflow.toNumber(),
    cashBalance: month.cashBalance.toNumber(),
    investmentBalance: month.investmentBalance.toNumber(),
    totalBalance: month.totalBalance.toNumber(),
  };
};

describe("simulation boundary cases", () => {
  it("uses bonus_amount_after when the change month is a bonus month", () => {
    const input = createBaseInput();
    input.incomeStreams = [
      {
        take_home_monthly: 100000,
        bonus_months: [6],
        bonus_amount: 20000,
        change_year_month: YearMonth.create("2025-06"),
        bonus_amount_after: 50000,
        raise_rate: 0,
        start_year_month: YearMonth.create("2025-01"),
        end_year_month: null,
      },
    ];

    expect(getMonth(input, "2025-05").totalIncome).toBe(100000);
    expect(getMonth(input, "2025-06").totalIncome).toBe(150000);
  });

  it("expands repeating events and stops at the configured occurrences", () => {
    const input = createBaseInput();
    input.lifeEvents = [
      {
        amount: 12000,
        year_month: YearMonth.create("2025-01"),
        repeat_interval_years: 2,
        stop_after_age: null,
        stop_after_occurrences: 2,
        category: travelCategory,
        auto_toggle_key: null,
        building_price: null,
        land_price: null,
        down_payment: null,
      },
    ];

    expect(getMonth(input, "2025-01").eventAmount).toBe(12000);
    expect(getMonth(input, "2027-01").eventAmount).toBe(12000);
    expect(getMonth(input, "2029-01").eventAmount).toBe(0);
  });

  it("stops rent in the month before the earliest housing purchase stop event", () => {
    const input = createBaseInput();
    input.rentals = [
      {
        id: "rental-1",
        rent_monthly: 80000,
        start_year_month: YearMonth.create("2025-01"),
        end_year_month: null,
      },
    ];
    input.lifeEvents = [
      {
        amount: 0,
        year_month: YearMonth.create("2025-06"),
        repeat_interval_years: null,
        stop_after_age: null,
        stop_after_occurrences: null,
        category: housingPurchaseCategory,
        auto_toggle_key: "HOUSING_PURCHASE_STOP_RENT",
        building_price: 0,
        land_price: 0,
        down_payment: 0,
      },
      {
        amount: 0,
        year_month: YearMonth.create("2025-04"),
        repeat_interval_years: null,
        stop_after_age: null,
        stop_after_occurrences: null,
        category: housingPurchaseCategory,
        auto_toggle_key: "HOUSING_PURCHASE_STOP_RENT",
        building_price: 0,
        land_price: 0,
        down_payment: 0,
      },
    ];

    expect(getMonth(input, "2025-03").totalExpense).toBe(80000);
    expect(getMonth(input, "2025-04").totalExpense).toBe(0);
  });

  it("applies investment returns after covering deficits from cash", () => {
    const input = createBaseInput();
    input.assets = [{ cash_balance: 0, investment_balance: 1000, return_rate: 0.12 }];
    input.expenses = [
      {
        amount_monthly: 1200,
        inflation_rate: 0,
        category: "living",
        start_year_month: YearMonth.create("2025-01"),
        end_year_month: null,
      },
    ];

    const month = getMonth(input, "2025-01");
    expect(month.cashBalance).toBe(0);
    expect(month.investmentBalance).toBeCloseTo(-202);
    expect(month.totalBalance).toBeCloseTo(-202);
  });

  it("ends the timeline at age 100", () => {
    const input = createBaseInput();
    input.profiles = {
      birth_year: 1970,
      birth_month: 1,
      spouse_birth_year: null,
      spouse_birth_month: null,
      pension_start_age: 65,
    };
    input.simulationSettings = { ...input.simulationSettings, end_age: 100 };

    const result = simulateLifePlan(input);
    const last = result.months.at(-1);
    if (!last) {
      throw new Error("Expected simulation to return at least one month.");
    }

    expect({
      yearMonth: last.yearMonth.toString(),
      age: last.age,
      spouseAge: last.spouseAge,
      totalIncome: last.totalIncome.toNumber(),
      totalExpense: last.totalExpense.toNumber(),
      eventAmount: last.eventAmount.toNumber(),
      netCashflow: last.netCashflow.toNumber(),
      cashBalance: last.cashBalance.toNumber(),
      investmentBalance: last.investmentBalance.toNumber(),
      totalBalance: last.totalBalance.toNumber(),
    }).toEqual({
      yearMonth: "2070-01",
      age: 100,
      spouseAge: null,
      totalIncome: 0,
      totalExpense: 0,
      eventAmount: 0,
      netCashflow: 0,
      cashBalance: 0,
      investmentBalance: 0,
      totalBalance: 0,
    });
    expect(result.months.some((month) => month.yearMonth.toString() === "2070-02")).toBe(false);
  });

  it("uses pension amounts from settings and counts retirement bonus once", () => {
    const input = createBaseInput();
    input.profiles = {
      birth_year: 1960,
      birth_month: 1,
      spouse_birth_year: null,
      spouse_birth_month: null,
      pension_start_age: 65,
    };
    input.simulationSettings = {
      ...input.simulationSettings,
      pension_amount_single: 12345,
    };
    input.lifeEvents = [
      {
        amount: 200000,
        year_month: YearMonth.create("2025-02"),
        repeat_interval_years: null,
        stop_after_age: null,
        stop_after_occurrences: null,
        category: retirementBonusCategory,
        auto_toggle_key: null,
        building_price: null,
        land_price: null,
        down_payment: null,
      },
    ];

    expect(getMonth(input, "2025-02").totalIncome).toBe(212345);
    expect(getMonth(input, "2025-02").eventAmount).toBe(0);
    expect(getMonth(input, "2025-03").totalIncome).toBe(12345);
  });

  it("uses housing coefficients from simulation settings", () => {
    const settings = {
      start_offset_months: 0,
      end_age: 100,
      pension_amount_single: 0,
      pension_amount_spouse: 0,
      mortgage_transaction_cost_rate: 1.08,
      real_estate_tax_rate: 0.02,
      real_estate_evaluation_rate: 0.5,
    };
    const event = {
      amount: 0,
      year_month: YearMonth.create("2030-01"),
      repeat_interval_years: null,
      stop_after_age: null,
      stop_after_occurrences: null,
      category: housingPurchaseCategory,
      auto_toggle_key: null,
      building_price: 10000000,
      land_price: 5000000,
      down_payment: 3000000,
    };

    const metrics = deriveHousingPurchaseMetrics(event, settings);

    expect(metrics.principal.toNumber()).toBeCloseTo(13200000);
    expect(metrics.realEstateTaxMonthly.toNumber()).toBeCloseTo(12500);
  });
});
