import { describe, expect, it } from "vitest";
import type { DashboardSimulationMonthlyResult } from "@/features/dashboard/queries/get-dashboard-simulation/response";
import {
  calculateSummaryMetrics,
  findDepletionYearMonth,
} from "@/features/dashboard/shared/summary";

const createMonth = (
  overrides: Partial<DashboardSimulationMonthlyResult> &
    Pick<DashboardSimulationMonthlyResult, "yearMonth">,
): DashboardSimulationMonthlyResult => ({
  yearMonth: overrides.yearMonth,
  age: overrides.age ?? 0,
  spouseAge: overrides.spouseAge ?? null,
  totalIncome: overrides.totalIncome ?? 0,
  totalExpense: overrides.totalExpense ?? 0,
  eventAmount: overrides.eventAmount ?? 0,
  netCashflow: overrides.netCashflow ?? 0,
  cashBalance: overrides.cashBalance ?? 0,
  investmentBalance: overrides.investmentBalance ?? 0,
  totalBalance: overrides.totalBalance ?? 0,
});

describe("dashboard summary metrics", () => {
  it("calculates cumulative cashflow and average monthly balance", () => {
    const months = [
      createMonth({
        yearMonth: "2025-01",
        totalIncome: 100,
        totalExpense: 70,
        eventAmount: 10,
        netCashflow: 40,
        totalBalance: 1000,
      }),
      createMonth({
        yearMonth: "2025-02",
        totalIncome: 80,
        totalExpense: 90,
        eventAmount: 0,
        netCashflow: -10,
        totalBalance: 900,
      }),
      createMonth({
        yearMonth: "2025-03",
        totalIncome: 120,
        totalExpense: 110,
        eventAmount: -20,
        netCashflow: -10,
        totalBalance: 850,
      }),
    ];

    const result = calculateSummaryMetrics(months);

    expect(result.cumulativeCashflow).toBe(20);
    expect(result.averageMonthlyBalance).toBeCloseTo(916.6667);
  });

  it("returns zero metrics when months are empty", () => {
    const result = calculateSummaryMetrics([]);

    expect(result.cumulativeCashflow).toBe(0);
    expect(result.averageMonthlyBalance).toBe(0);
  });

  it("finds the first month where total balance is negative", () => {
    const months = [
      createMonth({ yearMonth: "2025-01", totalBalance: 200 }),
      createMonth({ yearMonth: "2025-02", totalBalance: -10 }),
      createMonth({ yearMonth: "2025-03", totalBalance: -20 }),
    ];

    expect(findDepletionYearMonth(months)).toBe("2025-02");
  });

  it("returns null when there is no depletion month", () => {
    const months = [
      createMonth({ yearMonth: "2025-01", totalBalance: 200 }),
      createMonth({ yearMonth: "2025-02", totalBalance: 10 }),
    ];

    expect(findDepletionYearMonth(months)).toBeNull();
  });
});
