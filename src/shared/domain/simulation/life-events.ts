import { addMonths, calculateAgeAtYearMonth, yearMonthToElapsedMonths } from "./timeline";
import type {
  SimulationLifeEvent,
  SimulationProfile,
  SimulationSettings,
  YearMonth,
} from "./types";

export type HousingPurchaseMetrics = {
  event: SimulationLifeEvent;
  principal: number;
  realEstateTaxMonthly: number;
};

const toNumber = (value: number | null | undefined, fallback: number): number => value ?? fallback;

export const calculateMortgagePrincipal = ({
  buildingPrice,
  landPrice,
  downPayment,
  transactionCostRate,
}: {
  buildingPrice: number;
  landPrice: number;
  downPayment: number;
  transactionCostRate: number | null | undefined;
}): number => (buildingPrice + landPrice) * toNumber(transactionCostRate, 1) - downPayment;

export const calculateRealEstateTaxMonthly = ({
  buildingPrice,
  landPrice,
  evaluationRate,
  taxRate,
}: {
  buildingPrice: number;
  landPrice: number;
  evaluationRate: number | null | undefined;
  taxRate: number | null | undefined;
}): number =>
  ((buildingPrice + landPrice) * toNumber(evaluationRate, 0) * toNumber(taxRate, 0)) / 12;

const requireHousingPurchaseFields = (event: SimulationLifeEvent) => {
  if (event.building_price == null || event.land_price == null || event.down_payment == null) {
    throw new Error("Housing purchase event requires building_price, land_price, down_payment.");
  }
  return {
    buildingPrice: event.building_price,
    landPrice: event.land_price,
    downPayment: event.down_payment,
  };
};

export const deriveHousingPurchaseMetrics = (
  event: SimulationLifeEvent,
  settings: SimulationSettings,
): HousingPurchaseMetrics => {
  const { buildingPrice, landPrice, downPayment } = requireHousingPurchaseFields(event);
  const principal = calculateMortgagePrincipal({
    buildingPrice,
    landPrice,
    downPayment,
    transactionCostRate: settings.mortgage_transaction_cost_rate,
  });
  const realEstateTaxMonthly = calculateRealEstateTaxMonthly({
    buildingPrice,
    landPrice,
    evaluationRate: settings.real_estate_evaluation_rate,
    taxRate: settings.real_estate_tax_rate,
  });
  return {
    event,
    principal,
    realEstateTaxMonthly,
  };
};

export const expandLifeEvents = ({
  lifeEvents,
  startYearMonth,
  endYearMonth,
  profile,
}: {
  lifeEvents: SimulationLifeEvent[];
  startYearMonth: YearMonth;
  endYearMonth: YearMonth;
  profile: SimulationProfile;
}): SimulationLifeEvent[] => {
  const startIndex = yearMonthToElapsedMonths(startYearMonth);
  const endIndex = yearMonthToElapsedMonths(endYearMonth);
  const expanded: SimulationLifeEvent[] = [];
  const birthYear = profile.birth_year;
  const birthMonth = profile.birth_month;

  for (const event of lifeEvents) {
    const intervalYears = event.repeat_interval_years;
    const intervalMonths = intervalYears != null ? intervalYears * 12 : null;
    const stopAfter = event.stop_after_occurrences;
    const stopAfterAge = event.stop_after_age;
    let occurrences = 0;
    let currentYearMonth = event.year_month;

    while (true) {
      const currentIndex = yearMonthToElapsedMonths(currentYearMonth);
      if (currentIndex > endIndex) {
        break;
      }
      if (stopAfterAge != null) {
        if (birthYear == null || birthMonth == null) {
          throw new Error("Profile birth year/month is required to apply stop_after_age.");
        }
        const age = calculateAgeAtYearMonth(currentYearMonth, birthYear, birthMonth);
        if (age != null && age > stopAfterAge) {
          break;
        }
      }
      occurrences += 1;
      if (currentIndex >= startIndex) {
        expanded.push({ ...event, year_month: currentYearMonth });
      }
      if (intervalMonths == null || intervalMonths <= 0) {
        break;
      }
      if (stopAfter != null && occurrences >= stopAfter) {
        break;
      }
      currentYearMonth = addMonths(currentYearMonth, intervalMonths);
    }
  }

  return expanded.sort(
    (left, right) =>
      yearMonthToElapsedMonths(left.year_month) - yearMonthToElapsedMonths(right.year_month),
  );
};
