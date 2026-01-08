import { normalizeLifeEventRepeat } from "@/shared/domain/life-events/repeat";
import { BirthDate } from "@/shared/domain/value-objects/BirthDate";
import { Money } from "@/shared/domain/value-objects/Money";
import type { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import type { SimulationLifeEventDomain, SimulationProfile, SimulationSettings } from "./types";

export type HousingPurchaseMetrics = {
  event: SimulationLifeEventDomain;
  principal: Money;
  realEstateTaxMonthly: Money;
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
}): Money => {
  const totalValue = Money.of(buildingPrice).add(Money.of(landPrice));
  return totalValue.multiply(toNumber(transactionCostRate, 1)).minus(Money.of(downPayment));
};

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
}): Money => {
  const totalValue = Money.of(buildingPrice).add(Money.of(landPrice));
  // 評価額・年税額は切り捨て、月割りは不足回避のため切り上げる。
  const assessedValue = totalValue.multiplyAndRound(toNumber(evaluationRate, 0), "trunc");
  const annualTax = assessedValue.multiplyAndRound(toNumber(taxRate, 0), "trunc");
  return annualTax.divideAndRound(12, "ceil");
};

const requireHousingPurchaseFields = (event: SimulationLifeEventDomain) => {
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
  event: SimulationLifeEventDomain,
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
  lifeEvents: SimulationLifeEventDomain[];
  startYearMonth: YearMonth;
  endYearMonth: YearMonth;
  profile: SimulationProfile;
}): SimulationLifeEventDomain[] => {
  const startIndex = startYearMonth.toElapsedMonths();
  const endIndex = endYearMonth.toElapsedMonths();
  const expanded: SimulationLifeEventDomain[] = [];
  const birthDate =
    profile.birth_year != null && profile.birth_month != null
      ? BirthDate.fromYearMonth(profile.birth_year, profile.birth_month)
      : null;

  for (const event of lifeEvents) {
    const { intervalYears, stopAfterOccurrences, stopAfterAge } = normalizeLifeEventRepeat(event);
    const intervalMonths = intervalYears != null ? intervalYears * 12 : null;
    let occurrences = 0;
    let currentYearMonth = event.year_month;

    while (true) {
      const currentIndex = currentYearMonth.toElapsedMonths();
      if (currentIndex > endIndex) {
        break;
      }
      if (stopAfterAge != null) {
        if (!birthDate) {
          throw new Error("Profile birth year/month is required to apply stop_after_age.");
        }
        const age = birthDate.ageAt(currentYearMonth);
        if (age > stopAfterAge) {
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
      if (stopAfterOccurrences != null && occurrences >= stopAfterOccurrences) {
        break;
      }
      currentYearMonth = currentYearMonth.addMonths(intervalMonths);
    }
  }

  return expanded.sort(
    (left, right) => left.year_month.toElapsedMonths() - right.year_month.toElapsedMonths(),
  );
};
