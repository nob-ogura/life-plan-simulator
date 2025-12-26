import { deriveHousingPurchaseMetrics, expandLifeEvents } from "./life-events";
import { addMonths, generateMonthlyTimeline, yearMonthToElapsedMonths } from "./timeline";
import type {
  SimulationExpense,
  SimulationIncomeStream,
  SimulationInput,
  SimulationLifeEvent,
  SimulationRental,
  SimulationResult,
  YearMonth,
} from "./types";

const isYearMonthWithinRange = (
  yearMonth: YearMonth,
  start: YearMonth,
  end: YearMonth | null,
): boolean => {
  const targetIndex = yearMonthToElapsedMonths(yearMonth);
  const startIndex = yearMonthToElapsedMonths(start);
  if (targetIndex < startIndex) {
    return false;
  }
  if (end == null) {
    return true;
  }
  return targetIndex <= yearMonthToElapsedMonths(end);
};

const elapsedYearsSince = (yearMonth: YearMonth, start: YearMonth): number => {
  const targetIndex = yearMonthToElapsedMonths(yearMonth);
  const startIndex = yearMonthToElapsedMonths(start);
  const elapsedMonths = Math.max(0, targetIndex - startIndex);
  return Math.floor(elapsedMonths / 12);
};

const minYearMonth = (left: YearMonth, right: YearMonth): YearMonth =>
  yearMonthToElapsedMonths(left) <= yearMonthToElapsedMonths(right) ? left : right;

const isBonusMonth = (yearMonth: YearMonth, bonusMonths: number[]): boolean => {
  const monthText = yearMonth.slice(5, 7);
  const month = Number.parseInt(monthText, 10);
  return bonusMonths.includes(month);
};

const calculateBonusAmount = (stream: SimulationIncomeStream, yearMonth: YearMonth): number => {
  if (!isBonusMonth(yearMonth, stream.bonus_months)) {
    return 0;
  }
  if (stream.change_year_month == null) {
    return stream.bonus_amount;
  }
  const shouldUseAfter =
    yearMonthToElapsedMonths(yearMonth) >= yearMonthToElapsedMonths(stream.change_year_month);
  if (shouldUseAfter && stream.bonus_amount_after != null) {
    return stream.bonus_amount_after;
  }
  return stream.bonus_amount;
};

const calculateIncomeForStream = (stream: SimulationIncomeStream, yearMonth: YearMonth): number => {
  if (!isYearMonthWithinRange(yearMonth, stream.start_year_month, stream.end_year_month)) {
    return 0;
  }
  const elapsedYears = elapsedYearsSince(yearMonth, stream.start_year_month);
  const baseIncome = stream.take_home_monthly * (1 + stream.raise_rate) ** elapsedYears;
  return baseIncome + calculateBonusAmount(stream, yearMonth);
};

const calculateExpenseForItem = (expense: SimulationExpense, yearMonth: YearMonth): number => {
  if (!isYearMonthWithinRange(yearMonth, expense.start_year_month, expense.end_year_month)) {
    return 0;
  }
  const elapsedYears = elapsedYearsSince(yearMonth, expense.start_year_month);
  const inflationRate = expense.inflation_rate ?? 0;
  return expense.amount_monthly * (1 + inflationRate) ** elapsedYears;
};

const STOP_RENT_AUTO_TOGGLE_KEY = "HOUSING_PURCHASE_STOP_RENT";

const getRentalStopMonth = (
  rentalId: SimulationRental["id"],
  lifeEvents: SimulationLifeEvent[],
): YearMonth | null => {
  let earliestEventMonth: YearMonth | null = null;
  for (const event of lifeEvents) {
    if (event.auto_toggle_key !== STOP_RENT_AUTO_TOGGLE_KEY) {
      continue;
    }
    if (event.target_rental_id != null && event.target_rental_id !== rentalId) {
      continue;
    }
    if (earliestEventMonth == null) {
      earliestEventMonth = event.year_month;
    } else if (
      yearMonthToElapsedMonths(event.year_month) < yearMonthToElapsedMonths(earliestEventMonth)
    ) {
      earliestEventMonth = event.year_month;
    }
  }
  if (earliestEventMonth == null) {
    return null;
  }
  return addMonths(earliestEventMonth, -1);
};

const applyAutoToggleToRentals = (
  rentals: SimulationRental[],
  lifeEvents: SimulationLifeEvent[],
): SimulationRental[] =>
  rentals.map((rental) => {
    const stopMonth = getRentalStopMonth(rental.id, lifeEvents);
    if (stopMonth == null) {
      return rental;
    }
    const effectiveEnd =
      rental.end_year_month == null ? stopMonth : minYearMonth(stopMonth, rental.end_year_month);
    if (effectiveEnd === rental.end_year_month) {
      return rental;
    }
    return { ...rental, end_year_month: effectiveEnd };
  });

const calculateRentForRental = (rental: SimulationRental, yearMonth: YearMonth): number => {
  if (!isYearMonthWithinRange(yearMonth, rental.start_year_month, rental.end_year_month)) {
    return 0;
  }
  return rental.rent_monthly;
};

const calculateRetirementBonus = (
  yearMonth: YearMonth,
  lifeEvents: SimulationLifeEvent[],
): number =>
  lifeEvents
    .filter((event) => event.category === "retirement_bonus" && event.year_month === yearMonth)
    .reduce((total, event) => total + event.amount, 0);

export const simulateLifePlan = (input: SimulationInput): SimulationResult => {
  const timeline = generateMonthlyTimeline({
    currentYearMonth: input.currentYearMonth,
    startOffsetMonths: input.simulationSettings.start_offset_months ?? 0,
    endAge: input.simulationSettings.end_age ?? 100,
    profile: input.profiles,
  });
  if (timeline.length === 0) {
    return { months: [], depletionYearMonth: null };
  }
  const expandedLifeEvents = expandLifeEvents({
    lifeEvents: input.lifeEvents,
    startYearMonth: timeline[0].yearMonth,
    endYearMonth: timeline[timeline.length - 1].yearMonth,
  });
  const housingPurchases = expandedLifeEvents
    .filter((event) => event.category === "housing_purchase")
    .map((event) => deriveHousingPurchaseMetrics(event, input.simulationSettings));
  const rentals = applyAutoToggleToRentals(input.rentals, expandedLifeEvents);

  const months = timeline.map((month) => {
    const incomeFromStreams = input.incomeStreams.reduce(
      (total, stream) => total + calculateIncomeForStream(stream, month.yearMonth),
      0,
    );
    const pensionStartAge = input.profiles.pension_start_age;
    const pensionIncome =
      pensionStartAge != null && month.age >= pensionStartAge
        ? input.simulationSettings.pension_amount_single
        : 0;
    const spousePensionIncome =
      pensionStartAge != null && month.spouseAge != null && month.spouseAge >= pensionStartAge
        ? input.simulationSettings.pension_amount_spouse
        : 0;
    const retirementBonus = calculateRetirementBonus(month.yearMonth, expandedLifeEvents);
    const totalIncome = incomeFromStreams + pensionIncome + spousePensionIncome + retirementBonus;
    const baseExpense = input.expenses.reduce(
      (total, expense) => total + calculateExpenseForItem(expense, month.yearMonth),
      0,
    );
    const rentExpense = rentals.reduce(
      (total, rental) => total + calculateRentForRental(rental, month.yearMonth),
      0,
    );
    const realEstateTax = housingPurchases.reduce((total, purchase) => {
      if (
        yearMonthToElapsedMonths(month.yearMonth) <
        yearMonthToElapsedMonths(purchase.event.year_month)
      ) {
        return total;
      }
      return total + purchase.realEstateTaxMonthly;
    }, 0);
    const eventAmount = expandedLifeEvents.reduce((total, event) => {
      if (event.category === "retirement_bonus") {
        return total;
      }
      if (event.year_month !== month.yearMonth) {
        return total;
      }
      return total + event.amount;
    }, 0);
    const totalExpense = baseExpense + rentExpense + realEstateTax;

    return {
      yearMonth: month.yearMonth,
      age: month.age,
      spouseAge: month.spouseAge,
      totalIncome,
      totalExpense,
      eventAmount,
      cashBalance: 0,
      investmentBalance: 0,
      totalBalance: 0,
    };
  });

  return {
    months,
    depletionYearMonth: null,
  };
};
