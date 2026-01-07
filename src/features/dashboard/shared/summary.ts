import type { SimulationMonthlyResult, YearMonthString } from "@/shared/domain/simulation";

type DashboardSummaryMetrics = {
  cumulativeCashflow: number;
  averageMonthlyBalance: number;
};

const calculateMonthlyNet = (month: SimulationMonthlyResult) =>
  month.totalIncome - month.totalExpense + month.eventAmount;

export const calculateSummaryMetrics = (
  months: SimulationMonthlyResult[],
): DashboardSummaryMetrics => {
  if (months.length === 0) {
    return { cumulativeCashflow: 0, averageMonthlyBalance: 0 };
  }

  const cumulativeCashflow = months.reduce((sum, month) => sum + calculateMonthlyNet(month), 0);
  const averageMonthlyBalance =
    months.reduce((sum, month) => sum + month.totalBalance, 0) / months.length;

  return { cumulativeCashflow, averageMonthlyBalance };
};

export const findDepletionYearMonth = (months: SimulationMonthlyResult[]): YearMonthString | null =>
  months.find((month) => month.totalBalance < 0)?.yearMonth ?? null;
