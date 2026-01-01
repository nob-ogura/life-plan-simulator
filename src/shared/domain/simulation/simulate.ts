import {
  isHousingPurchase,
  isRetirementBonus,
  type LifeEventCategory,
} from "@/shared/domain/life-events/categories";
import { deriveHousingPurchaseMetrics, expandLifeEvents } from "./life-events";
import { addMonths, generateMonthlyTimeline, yearMonthToElapsedMonths } from "./timeline";
import type {
  SimulationAsset,
  SimulationExpense,
  SimulationIncomeStream,
  SimulationInput,
  SimulationLifeEvent,
  SimulationRental,
  SimulationResult,
  YearMonth,
} from "./types";

type TimelineMonth = ReturnType<typeof generateMonthlyTimeline>[number];
type HousingPurchaseMetrics = ReturnType<typeof deriveHousingPurchaseMetrics>;

type MonthlyCashFlow = {
  yearMonth: YearMonth;
  age: number;
  spouseAge: number | null;
  totalIncome: number;
  totalExpense: number;
  eventAmount: number;
};

type BalanceState = {
  cashBalance: number;
  investmentBalance: number;
  depletionYearMonth: YearMonth | null;
};

type SimulationContext = {
  input: SimulationInput;
  expandedLifeEvents: SimulationLifeEvent[];
  housingPurchases: HousingPurchaseMetrics[];
  rentals: SimulationRental[];
};

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

const getRentalStopMonth = (lifeEvents: SimulationLifeEvent[]): YearMonth | null => {
  let earliestEventMonth: YearMonth | null = null;
  for (const event of lifeEvents) {
    if (event.auto_toggle_key !== STOP_RENT_AUTO_TOGGLE_KEY) {
      continue;
    }
    if (!isHousingPurchase(event.category as LifeEventCategory)) {
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
): SimulationRental[] => {
  const stopMonth = getRentalStopMonth(lifeEvents);
  if (stopMonth == null) {
    return rentals;
  }
  return rentals.map((rental) => {
    const effectiveEnd =
      rental.end_year_month == null ? stopMonth : minYearMonth(stopMonth, rental.end_year_month);
    if (effectiveEnd === rental.end_year_month) {
      return rental;
    }
    return { ...rental, end_year_month: effectiveEnd };
  });
};

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
    .filter(
      (event) =>
        isRetirementBonus(event.category as LifeEventCategory) && event.year_month === yearMonth,
    )
    .reduce((total, event) => total + event.amount, 0);

const aggregateAssets = (assets: SimulationAsset[]) => {
  const totalCash = assets.reduce((sum, asset) => sum + (asset.cash_balance ?? 0), 0);
  const totalInvestment = assets.reduce((sum, asset) => sum + (asset.investment_balance ?? 0), 0);
  if (assets.length === 0) {
    return { cashBalance: 0, investmentBalance: 0, returnRate: 0 };
  }
  if (totalInvestment === 0) {
    const averageReturn =
      assets.reduce((sum, asset) => sum + (asset.return_rate ?? 0), 0) / assets.length;
    return {
      cashBalance: totalCash,
      investmentBalance: totalInvestment,
      returnRate: averageReturn,
    };
  }
  const weightedReturn =
    assets.reduce(
      (sum, asset) => sum + (asset.investment_balance ?? 0) * (asset.return_rate ?? 0),
      0,
    ) / totalInvestment;
  return {
    cashBalance: totalCash,
    investmentBalance: totalInvestment,
    returnRate: weightedReturn,
  };
};

const calculateMonthlyCashFlow = (
  context: SimulationContext,
  month: TimelineMonth,
): MonthlyCashFlow => {
  const { input, expandedLifeEvents, housingPurchases, rentals } = context;

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
    if (isRetirementBonus(event.category as LifeEventCategory)) {
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
  };
};

const applyBalances = (
  state: BalanceState,
  monthly: MonthlyCashFlow,
  monthlyReturnRate: number,
): { nextState: BalanceState; monthWithBalances: SimulationResult["months"][number] } => {
  let { cashBalance, investmentBalance, depletionYearMonth } = state;

  const cashFlow = monthly.totalIncome - monthly.totalExpense + monthly.eventAmount;
  cashBalance += cashFlow;
  if (cashBalance < 0) {
    const deficit = -cashBalance;
    investmentBalance -= deficit;
    cashBalance = 0;
  }
  investmentBalance *= 1 + monthlyReturnRate;
  const totalBalance = cashBalance + investmentBalance;
  if (depletionYearMonth == null && totalBalance < 0) {
    depletionYearMonth = monthly.yearMonth;
  }

  return {
    nextState: {
      cashBalance,
      investmentBalance,
      depletionYearMonth,
    },
    monthWithBalances: {
      ...monthly,
      cashBalance,
      investmentBalance,
      totalBalance,
    },
  };
};

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
    profile: input.profiles,
  });
  const housingPurchases = expandedLifeEvents
    .filter((event) => isHousingPurchase(event.category as LifeEventCategory))
    .map((event) => deriveHousingPurchaseMetrics(event, input.simulationSettings));
  const rentals = applyAutoToggleToRentals(input.rentals, expandedLifeEvents);

  const context: SimulationContext = {
    input,
    expandedLifeEvents,
    housingPurchases,
    rentals,
  };
  const monthlyCashFlows = timeline.map((month) => calculateMonthlyCashFlow(context, month));

  const aggregatedAssets = aggregateAssets(input.assets);
  const monthlyReturnRate = aggregatedAssets.returnRate / 12;

  let state: BalanceState = {
    cashBalance: aggregatedAssets.cashBalance,
    investmentBalance: aggregatedAssets.investmentBalance,
    depletionYearMonth: null,
  };
  const monthsWithBalances: SimulationResult["months"] = [];

  for (const monthly of monthlyCashFlows) {
    const { nextState, monthWithBalances } = applyBalances(state, monthly, monthlyReturnRate);
    state = nextState;
    monthsWithBalances.push(monthWithBalances);
  }

  return {
    months: monthsWithBalances,
    depletionYearMonth: state.depletionYearMonth,
  };
};
