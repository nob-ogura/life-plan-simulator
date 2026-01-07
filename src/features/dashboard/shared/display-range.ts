import type { DashboardSimulationMonthlyResult } from "@/features/dashboard/queries/get-dashboard-simulation/response";

export type DashboardDisplayRange = "recent-5-years" | "all";

export const DEFAULT_DISPLAY_RANGE: DashboardDisplayRange = "recent-5-years";

export const displayRangeOptions = [
  { value: "recent-5-years", label: "直近5年" },
  { value: "all", label: "全期間" },
] as const satisfies ReadonlyArray<{
  value: DashboardDisplayRange;
  label: string;
}>;

const RECENT_YEARS_MONTHS = 60;

export const filterSimulationMonthsByRange = (
  months: DashboardSimulationMonthlyResult[],
  range: DashboardDisplayRange,
) => {
  if (range === "recent-5-years") {
    if (months.length <= RECENT_YEARS_MONTHS) {
      return months;
    }
    return months.slice(0, RECENT_YEARS_MONTHS);
  }

  return months;
};
