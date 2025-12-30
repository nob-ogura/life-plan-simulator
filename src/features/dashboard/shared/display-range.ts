import type { SimulationMonthlyResult } from "@/shared/domain/simulation";

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
  months: SimulationMonthlyResult[],
  range: DashboardDisplayRange,
) => {
  if (range === "recent-5-years") {
    return months.length > RECENT_YEARS_MONTHS ? months.slice(0, RECENT_YEARS_MONTHS) : months;
  }

  return months;
};
