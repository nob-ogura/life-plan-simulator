import type { YearMonthString } from "@/shared/domain/simulation";

export type DashboardSimulationMonthlyResult = {
  yearMonth: YearMonthString;
  age: number;
  spouseAge: number | null;
  totalIncome: number;
  totalExpense: number;
  eventAmount: number;
  netCashflow: number;
  cashBalance: number;
  investmentBalance: number;
  totalBalance: number;
};

export type DashboardSimulationResult = {
  months: DashboardSimulationMonthlyResult[];
  depletionYearMonth: YearMonthString | null;
};

export type GetDashboardSimulationResponse = {
  result: DashboardSimulationResult | null;
};
