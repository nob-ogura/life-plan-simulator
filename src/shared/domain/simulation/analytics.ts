import type { Money } from "@/shared/domain/value-objects/Money";

type NumericLike = Money | number;

export type SimulationMonthlySummaryInput<TYearMonth = string> = {
  yearMonth: TYearMonth;
  netCashflow: NumericLike;
  totalBalance: NumericLike;
};

export type SimulationSummaryMetrics = {
  cumulativeCashflow: number;
  averageMonthlyBalance: number;
};

const toNumber = (value: NumericLike): number =>
  typeof value === "number" ? value : value.toNumber();

const isNegative = (value: NumericLike): boolean =>
  typeof value === "number" ? value < 0 : value.isNegative();

export const calculateSummaryMetrics = (
  months: SimulationMonthlySummaryInput[],
): SimulationSummaryMetrics => {
  if (months.length === 0) {
    return { cumulativeCashflow: 0, averageMonthlyBalance: 0 };
  }

  const cumulativeCashflow = months.reduce((sum, month) => sum + toNumber(month.netCashflow), 0);
  const averageMonthlyBalance =
    months.reduce((sum, month) => sum + toNumber(month.totalBalance), 0) / months.length;

  return { cumulativeCashflow, averageMonthlyBalance };
};

export const findDepletionYearMonth = <TYearMonth>(
  months: SimulationMonthlySummaryInput<TYearMonth>[],
): TYearMonth | null => {
  const depletionMonth = months.find((month) => isNegative(month.totalBalance));
  return depletionMonth ? depletionMonth.yearMonth : null;
};
