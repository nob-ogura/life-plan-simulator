import type { DashboardSimulationMonthlyResult } from "@/features/dashboard/queries/get-dashboard-simulation/response";
import type { YearMonthString } from "@/shared/domain/simulation";
import { Money } from "@/shared/domain/value-objects/Money";

type DashboardSummaryMetrics = {
  cumulativeCashflow: number;
  averageMonthlyBalance: number;
};

export const calculateSummaryMetrics = (
  months: DashboardSimulationMonthlyResult[],
): DashboardSummaryMetrics => {
  if (months.length === 0) {
    return { cumulativeCashflow: 0, averageMonthlyBalance: 0 };
  }

  const cumulativeCashflow = months.reduce((sum, month) => sum + month.netCashflow, 0);
  const averageMonthlyBalance =
    months.reduce((sum, month) => sum + month.totalBalance, 0) / months.length;

  return { cumulativeCashflow, averageMonthlyBalance };
};

export const findDepletionYearMonth = (
  months: DashboardSimulationMonthlyResult[],
): YearMonthString | null =>
  months.find((month) => Money.of(month.totalBalance).isNegative())?.yearMonth ?? null;
