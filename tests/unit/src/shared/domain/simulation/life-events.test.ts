import { describe, expect, it } from "vitest";
import type { LifeEventCategory } from "@/shared/domain/life-events/categories";
import {
  calculateMortgagePrincipal,
  calculateRealEstateTaxMonthly,
  deriveHousingPurchaseMetrics,
  type SimulationInputDomain,
  type SimulationLifeEventDomain,
  type SimulationSettings,
  simulateLifePlan,
} from "@/shared/domain/simulation";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";

const travelCategory: LifeEventCategory = "travel";
const housingPurchaseCategory: LifeEventCategory = "housing_purchase";

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
    end_age: 70,
    pension_amount_single: 0,
    pension_amount_spouse: 0,
    mortgage_transaction_cost_rate: 1.05,
    real_estate_tax_rate: 0.014,
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

describe("life events", () => {
  it("expands repeating events until the stop count", () => {
    const input = createBaseInput();
    input.lifeEvents = [
      {
        amount: 10000,
        year_month: YearMonth.create("2025-01"),
        repeat_interval_years: 1,
        stop_after_age: null,
        stop_after_occurrences: 3,
        category: travelCategory,
        auto_toggle_key: null,
        building_price: null,
        land_price: null,
        down_payment: null,
      },
    ];

    expect(getMonth(input, "2025-01").eventAmount).toBe(10000);
    expect(getMonth(input, "2026-01").eventAmount).toBe(10000);
    expect(getMonth(input, "2027-01").eventAmount).toBe(10000);
    expect(getMonth(input, "2028-01").eventAmount).toBe(0);
  });

  it("stops repeating events when stop_after_age is reached", () => {
    const input = createBaseInput();
    input.lifeEvents = [
      {
        amount: 10000,
        year_month: YearMonth.create("2025-01"),
        repeat_interval_years: 1,
        stop_after_age: 36,
        stop_after_occurrences: null,
        category: travelCategory,
        auto_toggle_key: null,
        building_price: null,
        land_price: null,
        down_payment: null,
      },
    ];

    expect(getMonth(input, "2025-01").eventAmount).toBe(10000);
    expect(getMonth(input, "2026-01").eventAmount).toBe(10000);
    expect(getMonth(input, "2027-01").eventAmount).toBe(0);
  });

  it("stops at the earlier of stop_after_occurrences and stop_after_age", () => {
    const input = createBaseInput();
    input.lifeEvents = [
      {
        amount: 10000,
        year_month: YearMonth.create("2025-01"),
        repeat_interval_years: 1,
        stop_after_age: 35,
        stop_after_occurrences: 5,
        category: travelCategory,
        auto_toggle_key: null,
        building_price: null,
        land_price: null,
        down_payment: null,
      },
    ];

    expect(getMonth(input, "2025-01").eventAmount).toBe(10000);
    expect(getMonth(input, "2026-01").eventAmount).toBe(0);
  });

  it("calculates mortgage principal and real estate tax using settings", () => {
    expect(
      calculateMortgagePrincipal({
        buildingPrice: 20000000,
        landPrice: 10000000,
        downPayment: 5000000,
        transactionCostRate: 1.05,
      }).toNumber(),
    ).toBeCloseTo(26500000);

    expect(
      calculateRealEstateTaxMonthly({
        buildingPrice: 20000000,
        landPrice: 10000000,
        evaluationRate: 0.7,
        taxRate: 0.014,
      }).toNumber(),
    ).toBeCloseTo(24500);
  });

  it("derives housing purchase metrics from simulation settings", () => {
    const event: SimulationLifeEventDomain = {
      amount: 0,
      year_month: YearMonth.create("2025-03"),
      repeat_interval_years: null,
      stop_after_age: null,
      stop_after_occurrences: null,
      category: housingPurchaseCategory,
      auto_toggle_key: null,
      building_price: 20000000,
      land_price: 10000000,
      down_payment: 5000000,
    };
    const settings: SimulationSettings = {
      start_offset_months: 0,
      end_age: 70,
      pension_amount_single: 0,
      pension_amount_spouse: 0,
      mortgage_transaction_cost_rate: 1.08,
      real_estate_tax_rate: 0.02,
      real_estate_evaluation_rate: 0.5,
    };

    const metrics = deriveHousingPurchaseMetrics(event, settings);

    expect(metrics.principal.toNumber()).toBeCloseTo(27400000);
    expect(metrics.realEstateTaxMonthly.toNumber()).toBeCloseTo(25000);
  });

  it("updates housing purchase metrics when settings change", () => {
    const event: SimulationLifeEventDomain = {
      amount: 0,
      year_month: YearMonth.create("2025-03"),
      repeat_interval_years: null,
      stop_after_age: null,
      stop_after_occurrences: null,
      category: housingPurchaseCategory,
      auto_toggle_key: null,
      building_price: 20000000,
      land_price: 10000000,
      down_payment: 5000000,
    };
    const baseSettings: SimulationSettings = {
      start_offset_months: 0,
      end_age: 70,
      pension_amount_single: 0,
      pension_amount_spouse: 0,
      mortgage_transaction_cost_rate: 1.02,
      real_estate_tax_rate: 0.01,
      real_estate_evaluation_rate: 0.6,
    };
    const updatedSettings: SimulationSettings = {
      ...baseSettings,
      mortgage_transaction_cost_rate: 1.08,
      real_estate_tax_rate: 0.02,
      real_estate_evaluation_rate: 0.5,
    };

    const baseMetrics = deriveHousingPurchaseMetrics(event, baseSettings);
    const updatedMetrics = deriveHousingPurchaseMetrics(event, updatedSettings);

    expect(baseMetrics.principal.toNumber()).toBeCloseTo(25600000);
    expect(baseMetrics.realEstateTaxMonthly.toNumber()).toBeCloseTo(15000);
    expect(updatedMetrics.principal.toNumber()).toBeCloseTo(27400000);
    expect(updatedMetrics.realEstateTaxMonthly.toNumber()).toBeCloseTo(25000);
    expect(updatedMetrics.principal.toNumber()).not.toBe(baseMetrics.principal.toNumber());
    expect(updatedMetrics.realEstateTaxMonthly.toNumber()).not.toBe(
      baseMetrics.realEstateTaxMonthly.toNumber(),
    );
  });

  it("adds real estate tax from the housing purchase month", () => {
    const input = createBaseInput();
    input.lifeEvents = [
      {
        amount: 0,
        year_month: YearMonth.create("2025-03"),
        repeat_interval_years: null,
        stop_after_age: null,
        stop_after_occurrences: null,
        category: housingPurchaseCategory,
        auto_toggle_key: null,
        building_price: 20000000,
        land_price: 10000000,
        down_payment: 5000000,
      },
    ];

    expect(getMonth(input, "2025-02").totalExpense).toBe(0);
    expect(getMonth(input, "2025-03").totalExpense).toBeCloseTo(24500);
    expect(getMonth(input, "2025-04").totalExpense).toBeCloseTo(24500);
  });

  it("requires housing purchase fields", () => {
    const input = createBaseInput();
    input.lifeEvents = [
      {
        amount: 0,
        year_month: YearMonth.create("2025-03"),
        repeat_interval_years: null,
        stop_after_age: null,
        stop_after_occurrences: null,
        category: housingPurchaseCategory,
        auto_toggle_key: null,
        building_price: null,
        land_price: 10000000,
        down_payment: 5000000,
      },
    ];

    expect(() => simulateLifePlan(input)).toThrow();
  });
});
