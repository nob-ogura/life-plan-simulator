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
  SimulationChildDomain,
  SimulationExpense,
  SimulationExpenseDomain,
  SimulationIncomeStream,
  SimulationIncomeStreamDomain,
  SimulationInput,
  SimulationInputDomain,
  SimulationInputDto,
  SimulationLifeEvent,
  SimulationLifeEventDomain,
  SimulationMonthlyResult,
  SimulationMonthlyResultDomain,
  SimulationMonthlyResultDto,
  SimulationMortgage,
  SimulationMortgageDomain,
  SimulationProfile,
  SimulationRental,
  SimulationRentalDomain,
  SimulationResult,
  SimulationResultDomain,
  SimulationResultDto,
  SimulationSettings,
  YearMonthString,
} from "./types";
