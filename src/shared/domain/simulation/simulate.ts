import {
  isHousingPurchase,
  isRetirementBonus,
  type LifeEventCategory,
} from "@/shared/domain/life-events/categories";
import { Money } from "@/shared/domain/value-objects/Money";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import { deriveHousingPurchaseMetrics, expandLifeEvents } from "./life-events";
import { addMonths, generateMonthlyTimeline } from "./timeline";
import type {
  SimulationAsset,
  SimulationExpense,
  SimulationIncomeStream,
  SimulationInput,
  SimulationLifeEvent,
  SimulationRental,
  SimulationResult,
  YearMonthString,
} from "./types";

type TimelineMonth = ReturnType<typeof generateMonthlyTimeline>[number];
type HousingPurchaseMetrics = ReturnType<typeof deriveHousingPurchaseMetrics>;

type MonthlyCashFlow = {
  yearMonth: YearMonthString;
  age: number;
  spouseAge: number | null;
  totalIncome: Money;
  totalExpense: Money;
  eventAmount: Money;
};

type BalanceState = {
  cashBalance: Money;
  investmentBalance: Money;
  depletionYearMonth: YearMonthString | null;
};

type SimulationContext = {
  input: SimulationInput;
  expandedLifeEvents: SimulationLifeEvent[];
  housingPurchases: HousingPurchaseMetrics[];
  rentals: SimulationRental[];
};

const isYearMonthWithinRange = (
  yearMonth: YearMonthString,
  start: YearMonthString,
  end: YearMonthString | null,
): boolean => {
  const target = YearMonth.create(yearMonth);
  const startValue = YearMonth.create(start);
  if (target.isBefore(startValue)) {
    return false;
  }
  if (end == null) {
    return true;
  }
  return !target.isAfter(YearMonth.create(end));
};

const elapsedYearsSince = (yearMonth: YearMonthString, start: YearMonthString): number => {
  const target = YearMonth.create(yearMonth);
  const startValue = YearMonth.create(start);
  const elapsedMonths = Math.max(0, target.toElapsedMonths() - startValue.toElapsedMonths());
  return Math.floor(elapsedMonths / 12);
};

const minYearMonth = (left: YearMonthString, right: YearMonthString): YearMonthString => {
  const leftValue = YearMonth.create(left);
  const rightValue = YearMonth.create(right);
  return leftValue.isAfter(rightValue) ? right : left;
};

const isBonusMonth = (yearMonth: YearMonthString, bonusMonths: number[]): boolean =>
  bonusMonths.includes(YearMonth.create(yearMonth).getMonth());

const calculateBonusAmount = (
  stream: SimulationIncomeStream,
  yearMonth: YearMonthString,
): Money => {
  if (!isBonusMonth(yearMonth, stream.bonus_months)) {
    return Money.of(0);
  }
  if (stream.change_year_month == null) {
    return Money.of(stream.bonus_amount);
  }
  const target = YearMonth.create(yearMonth);
  const change = YearMonth.create(stream.change_year_month);
  const shouldUseAfter = !target.isBefore(change);
  if (shouldUseAfter && stream.bonus_amount_after != null) {
    return Money.of(stream.bonus_amount_after);
  }
  return Money.of(stream.bonus_amount);
};

const calculateIncomeForStream = (
  stream: SimulationIncomeStream,
  yearMonth: YearMonthString,
): Money => {
  if (!isYearMonthWithinRange(yearMonth, stream.start_year_month, stream.end_year_month)) {
    return Money.of(0);
  }
  const elapsedYears = elapsedYearsSince(yearMonth, stream.start_year_month);
  const baseIncome = Money.of(stream.take_home_monthly).multiply(
    (1 + stream.raise_rate) ** elapsedYears,
  );
  return baseIncome.add(calculateBonusAmount(stream, yearMonth));
};

const calculateExpenseForItem = (expense: SimulationExpense, yearMonth: YearMonthString): Money => {
  if (!isYearMonthWithinRange(yearMonth, expense.start_year_month, expense.end_year_month)) {
    return Money.of(0);
  }
  const elapsedYears = elapsedYearsSince(yearMonth, expense.start_year_month);
  const inflationRate = expense.inflation_rate ?? 0;
  return Money.of(expense.amount_monthly).multiply((1 + inflationRate) ** elapsedYears);
};

const STOP_RENT_AUTO_TOGGLE_KEY = "HOUSING_PURCHASE_STOP_RENT";

const getRentalStopMonth = (lifeEvents: SimulationLifeEvent[]): YearMonthString | null => {
  let earliestEventMonth: YearMonthString | null = null;
  for (const event of lifeEvents) {
    if (event.auto_toggle_key !== STOP_RENT_AUTO_TOGGLE_KEY) {
      continue;
    }
    if (!isHousingPurchase(event.category as LifeEventCategory)) {
      continue;
    }
    if (earliestEventMonth == null) {
      earliestEventMonth = event.year_month;
    } else if (YearMonth.create(event.year_month).isBefore(YearMonth.create(earliestEventMonth))) {
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

const calculateRentForRental = (rental: SimulationRental, yearMonth: YearMonthString): Money => {
  if (!isYearMonthWithinRange(yearMonth, rental.start_year_month, rental.end_year_month)) {
    return Money.of(0);
  }
  return Money.of(rental.rent_monthly);
};

const calculateRetirementBonus = (
  yearMonth: YearMonthString,
  lifeEvents: SimulationLifeEvent[],
): Money => {
  const targetMonth = YearMonth.create(yearMonth);
  return lifeEvents.reduce((total, event) => {
    if (!isRetirementBonus(event.category as LifeEventCategory)) {
      return total;
    }
    if (!targetMonth.equals(YearMonth.create(event.year_month))) {
      return total;
    }
    return total.add(Money.of(event.amount));
  }, Money.of(0));
};

const aggregateAssets = (assets: SimulationAsset[]) => {
  const totalCash = assets.reduce((sum, asset) => sum + (asset.cash_balance ?? 0), 0);
  const totalInvestment = assets.reduce((sum, asset) => sum + (asset.investment_balance ?? 0), 0);
  if (assets.length === 0) {
    return { cashBalance: Money.of(0), investmentBalance: Money.of(0), returnRate: 0 };
  }
  if (totalInvestment === 0) {
    const averageReturn =
      assets.reduce((sum, asset) => sum + (asset.return_rate ?? 0), 0) / assets.length;
    return {
      cashBalance: Money.of(totalCash),
      investmentBalance: Money.of(totalInvestment),
      returnRate: averageReturn,
    };
  }
  const weightedReturn =
    assets.reduce(
      (sum, asset) => sum + (asset.investment_balance ?? 0) * (asset.return_rate ?? 0),
      0,
    ) / totalInvestment;
  return {
    cashBalance: Money.of(totalCash),
    investmentBalance: Money.of(totalInvestment),
    returnRate: weightedReturn,
  };
};

const calculateMonthlyCashFlow = (
  context: SimulationContext,
  month: TimelineMonth,
): MonthlyCashFlow => {
  const { input, expandedLifeEvents, housingPurchases, rentals } = context;

  const incomeFromStreams = input.incomeStreams.reduce(
    (total, stream) => total.add(calculateIncomeForStream(stream, month.yearMonth)),
    Money.of(0),
  );
  const pensionStartAge = input.profiles.pension_start_age;
  const pensionIncome = Money.of(
    pensionStartAge != null && month.age >= pensionStartAge
      ? input.simulationSettings.pension_amount_single
      : 0,
  );
  const spousePensionIncome = Money.of(
    pensionStartAge != null && month.spouseAge != null && month.spouseAge >= pensionStartAge
      ? input.simulationSettings.pension_amount_spouse
      : 0,
  );
  const retirementBonus = calculateRetirementBonus(month.yearMonth, expandedLifeEvents);
  const totalIncome = incomeFromStreams
    .add(pensionIncome)
    .add(spousePensionIncome)
    .add(retirementBonus);
  const baseExpense = input.expenses.reduce(
    (total, expense) => total.add(calculateExpenseForItem(expense, month.yearMonth)),
    Money.of(0),
  );
  const rentExpense = rentals.reduce(
    (total, rental) => total.add(calculateRentForRental(rental, month.yearMonth)),
    Money.of(0),
  );
  const monthValue = YearMonth.create(month.yearMonth);
  const realEstateTax = housingPurchases.reduce((total, purchase) => {
    if (monthValue.isBefore(YearMonth.create(purchase.event.year_month))) {
      return total;
    }
    return total.add(Money.of(purchase.realEstateTaxMonthly));
  }, Money.of(0));
  const eventAmount = expandedLifeEvents.reduce((total, event) => {
    if (isRetirementBonus(event.category as LifeEventCategory)) {
      return total;
    }
    if (!monthValue.equals(YearMonth.create(event.year_month))) {
      return total;
    }
    return total.add(Money.of(event.amount));
  }, Money.of(0));
  const totalExpense = baseExpense.add(rentExpense).add(realEstateTax);

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

  const cashFlow = monthly.totalIncome.minus(monthly.totalExpense).add(monthly.eventAmount);
  cashBalance = cashBalance.add(cashFlow);
  if (cashBalance.isNegative()) {
    const deficit = cashBalance.abs();
    investmentBalance = investmentBalance.minus(deficit);
    cashBalance = Money.of(0);
  }
  investmentBalance = investmentBalance.multiply(1 + monthlyReturnRate);
  const totalBalance = cashBalance.add(investmentBalance);
  if (depletionYearMonth == null && totalBalance.isNegative()) {
    depletionYearMonth = monthly.yearMonth;
  }

  return {
    nextState: {
      cashBalance,
      investmentBalance,
      depletionYearMonth,
    },
    monthWithBalances: {
      yearMonth: monthly.yearMonth,
      age: monthly.age,
      spouseAge: monthly.spouseAge,
      totalIncome: monthly.totalIncome.toNumber(),
      totalExpense: monthly.totalExpense.toNumber(),
      eventAmount: monthly.eventAmount.toNumber(),
      cashBalance: cashBalance.toNumber(),
      investmentBalance: investmentBalance.toNumber(),
      totalBalance: totalBalance.toNumber(),
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
  const firstTimeline = timeline[0];
  const lastTimeline = timeline[timeline.length - 1];
  if (!firstTimeline || !lastTimeline) {
    return { months: [], depletionYearMonth: null };
  }
  const expandedLifeEvents = expandLifeEvents({
    lifeEvents: input.lifeEvents,
    startYearMonth: firstTimeline.yearMonth,
    endYearMonth: lastTimeline.yearMonth,
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
