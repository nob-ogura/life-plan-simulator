export {
  calculateMortgagePrincipal,
  calculateRealEstateTaxMonthly,
  deriveHousingPurchaseMetrics,
  expandLifeEvents,
} from "./life-events";
export { simulateLifePlan } from "./simulate";
export type { TimelineMonth } from "./timeline";
export {
  addMonths,
  elapsedMonthsToYearMonth,
  generateMonthlyTimeline,
  yearMonthToElapsedMonths,
} from "./timeline";
export type {
  SimulationAsset,
  SimulationChild,
  SimulationExpense,
  SimulationIncomeStream,
  SimulationInput,
  SimulationLifeEvent,
  SimulationMonthlyResult,
  SimulationMortgage,
  SimulationProfile,
  SimulationRental,
  SimulationResult,
  SimulationSettings,
  YearMonthString,
} from "./types";
