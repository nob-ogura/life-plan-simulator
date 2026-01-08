export {
  calculateMortgagePrincipal,
  calculateRealEstateTaxMonthly,
  deriveHousingPurchaseMetrics,
  expandLifeEvents,
} from "./life-events";
export { simulateLifePlan } from "./simulate";
export type { TimelineMonth } from "./timeline";
export { generateMonthlyTimeline } from "./timeline";
export type {
  SimulationAsset,
  SimulationChild,
  SimulationChildDomain,
  SimulationExpense,
  SimulationExpenseDomain,
  SimulationIncomeStream,
  SimulationIncomeStreamDomain,
  SimulationInputDomain,
  SimulationInputDto,
  SimulationLifeEvent,
  SimulationLifeEventDomain,
  SimulationMonthlyResultDomain,
  SimulationMonthlyResultDto,
  SimulationMortgage,
  SimulationMortgageDomain,
  SimulationProfile,
  SimulationRental,
  SimulationRentalDomain,
  SimulationResultDomain,
  SimulationResultDto,
  SimulationSettings,
  YearMonthString,
} from "./types";
