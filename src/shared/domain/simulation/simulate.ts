import {
  isHousingPurchase,
  isRetirementBonus,
  type LifeEventCategory,
} from "@/shared/domain/life-events/categories";
import { Money } from "@/shared/domain/value-objects/Money";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import {
  calculateMortgagePrincipal,
  deriveHousingPurchaseMetrics,
  expandLifeEvents,
} from "./life-events";
import { generateMonthlyTimeline } from "./timeline";
import type {
  SimulationAsset,
  SimulationExpenseDomain,
  SimulationIncomeStreamDomain,
  SimulationInputDomain,
  SimulationLifeEventDomain,
  SimulationMortgageDomain,
  SimulationRentalDomain,
  SimulationResultDomain,
  SimulationSettings,
} from "./types";

type TimelineMonth = ReturnType<typeof generateMonthlyTimeline>[number];
type HousingPurchaseMetrics = ReturnType<typeof deriveHousingPurchaseMetrics>;

type MonthlyCashFlow = {
  yearMonth: YearMonth;
  age: number;
  spouseAge: number | null;
  totalIncome: Money;
  totalExpense: Money;
  eventAmount: Money;
};

type BalanceState = {
  cashBalance: Money;
  investmentBalance: Money;
  depletionYearMonth: YearMonth | null;
};

type MortgagePaymentPlan = {
  mortgage: SimulationMortgageDomain;
  monthlyPayment: Money;
  totalMonths: number;
};

type SimulationContext = {
  input: SimulationInputDomain;
  expandedLifeEvents: SimulationLifeEventDomain[];
  housingPurchases: HousingPurchaseMetrics[];
  rentals: SimulationRentalDomain[];
  mortgagePayments: MortgagePaymentPlan[];
};

const isYearMonthWithinRange = (
  yearMonth: YearMonth,
  start: YearMonth,
  end: YearMonth | null,
): boolean => {
  if (yearMonth.isBefore(start)) {
    return false;
  }
  if (end == null) {
    return true;
  }
  return !yearMonth.isAfter(end);
};

const isBonusMonth = (yearMonth: YearMonth, bonusMonths: number[]): boolean =>
  bonusMonths.includes(yearMonth.getMonth());

const calculateBonusAmount = (
  stream: SimulationIncomeStreamDomain,
  yearMonth: YearMonth,
): Money => {
  if (!isBonusMonth(yearMonth, stream.bonus_months)) {
    return Money.of(0);
  }
  if (stream.change_year_month == null) {
    return Money.of(stream.bonus_amount);
  }
  const shouldUseAfter = !yearMonth.isBefore(stream.change_year_month);
  if (shouldUseAfter && stream.bonus_amount_after != null) {
    return Money.of(stream.bonus_amount_after);
  }
  return Money.of(stream.bonus_amount);
};

const calculateIncomeForStream = (
  stream: SimulationIncomeStreamDomain,
  yearMonth: YearMonth,
): Money => {
  if (!isYearMonthWithinRange(yearMonth, stream.start_year_month, stream.end_year_month)) {
    return Money.of(0);
  }
  const elapsedYears = yearMonth.elapsedYearsSince(stream.start_year_month);
  const baseIncome = Money.of(stream.take_home_monthly).multiply(
    (1 + stream.raise_rate) ** elapsedYears,
  );
  return baseIncome.add(calculateBonusAmount(stream, yearMonth));
};

const calculateExpenseForItem = (expense: SimulationExpenseDomain, yearMonth: YearMonth): Money => {
  if (!isYearMonthWithinRange(yearMonth, expense.start_year_month, expense.end_year_month)) {
    return Money.of(0);
  }
  const elapsedYears = yearMonth.elapsedYearsSince(expense.start_year_month);
  const inflationRate = expense.inflation_rate ?? 0;
  return Money.of(expense.amount_monthly).multiply((1 + inflationRate) ** elapsedYears);
};

const STOP_RENT_AUTO_TOGGLE_KEY = "HOUSING_PURCHASE_STOP_RENT";

const getRentalStopMonth = (lifeEvents: SimulationLifeEventDomain[]): YearMonth | null => {
  const stopEventMonths = lifeEvents
    .filter(
      (event) =>
        event.auto_toggle_key === STOP_RENT_AUTO_TOGGLE_KEY &&
        isHousingPurchase(event.category as LifeEventCategory),
    )
    .map((event) => event.year_month);
  if (stopEventMonths.length === 0) {
    return null;
  }
  return YearMonth.min(...stopEventMonths).addMonths(-1);
};

const applyAutoToggleToRentals = (
  rentals: SimulationRentalDomain[],
  lifeEvents: SimulationLifeEventDomain[],
): SimulationRentalDomain[] => {
  const stopMonth = getRentalStopMonth(lifeEvents);
  if (stopMonth == null) {
    return rentals;
  }
  return rentals.map((rental) => {
    const effectiveEnd =
      rental.end_year_month == null ? stopMonth : YearMonth.min(stopMonth, rental.end_year_month);
    if (rental.end_year_month && effectiveEnd.equals(rental.end_year_month)) {
      return rental;
    }
    return { ...rental, end_year_month: effectiveEnd };
  });
};

const calculateRentForRental = (rental: SimulationRentalDomain, yearMonth: YearMonth): Money => {
  if (!isYearMonthWithinRange(yearMonth, rental.start_year_month, rental.end_year_month)) {
    return Money.of(0);
  }
  return Money.of(rental.rent_monthly);
};

const calculateRetirementBonus = (
  yearMonth: YearMonth,
  lifeEvents: SimulationLifeEventDomain[],
): Money => {
  return lifeEvents.reduce((total, event) => {
    if (!isRetirementBonus(event.category as LifeEventCategory)) {
      return total;
    }
    if (!yearMonth.equals(event.year_month)) {
      return total;
    }
    return total.add(Money.of(event.amount));
  }, Money.of(0));
};

const aggregateAssets = (assets: SimulationAsset[]) => {
  const totalCash = assets.reduce(
    (sum, asset) => sum.add(Money.of(asset.cash_balance ?? 0)),
    Money.of(0),
  );
  const totalInvestment = assets.reduce(
    (sum, asset) => sum.add(Money.of(asset.investment_balance ?? 0)),
    Money.of(0),
  );
  if (assets.length === 0) {
    return { cashBalance: Money.of(0), investmentBalance: Money.of(0), returnRate: 0 };
  }
  if (totalInvestment.toNumber() === 0) {
    const averageReturn =
      assets.reduce((sum, asset) => sum + (asset.return_rate ?? 0), 0) / assets.length;
    return {
      cashBalance: totalCash,
      investmentBalance: totalInvestment,
      returnRate: averageReturn,
    };
  }
  const weightedNumerator = assets.reduce(
    (sum, asset) =>
      sum.add(Money.of(asset.investment_balance ?? 0).multiply(asset.return_rate ?? 0)),
    Money.of(0),
  );
  const weightedReturn = weightedNumerator.ratio(totalInvestment);
  return {
    cashBalance: totalCash,
    investmentBalance: totalInvestment,
    returnRate: weightedReturn,
  };
};

const toLoanMonths = (years: number): number => {
  if (!Number.isFinite(years)) {
    return 0;
  }
  return Math.max(0, Math.trunc(years * 12));
};

const calculateMortgageMonthlyPayment = (
  mortgage: SimulationMortgageDomain,
  settings: SimulationSettings,
): Money => {
  const principal = calculateMortgagePrincipal({
    buildingPrice: mortgage.building_price,
    landPrice: mortgage.land_price,
    downPayment: mortgage.down_payment,
    transactionCostRate: settings.mortgage_transaction_cost_rate,
  }).toRoundedNumber("round");
  const totalMonths = toLoanMonths(mortgage.years);
  if (principal <= 0 || totalMonths <= 0) {
    return Money.of(0);
  }
  const annualRate = mortgage.annual_rate ?? 0;
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) {
    return Money.fromFloat(principal / totalMonths, "round");
  }
  const factor = (1 + monthlyRate) ** totalMonths;
  if (!Number.isFinite(factor) || factor === 1) {
    return Money.of(0);
  }
  const payment = (principal * monthlyRate * factor) / (factor - 1);
  return Money.fromFloat(payment, "round");
};

const isMortgageActive = (plan: MortgagePaymentPlan, yearMonth: YearMonth): boolean => {
  const elapsedMonths =
    yearMonth.toElapsedMonths() - plan.mortgage.start_year_month.toElapsedMonths();
  return elapsedMonths >= 0 && elapsedMonths < plan.totalMonths;
};

const calculateMonthlyCashFlow = (
  context: SimulationContext,
  month: TimelineMonth,
): MonthlyCashFlow => {
  const { input, expandedLifeEvents, housingPurchases, rentals, mortgagePayments } = context;

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
  const mortgageExpense = mortgagePayments.reduce((total, plan) => {
    if (plan.totalMonths <= 0 || plan.monthlyPayment.toNumber() === 0) {
      return total;
    }
    if (!isMortgageActive(plan, month.yearMonth)) {
      return total;
    }
    return total.add(plan.monthlyPayment);
  }, Money.of(0));
  const monthValue = month.yearMonth;
  const realEstateTax = housingPurchases.reduce((total, purchase) => {
    if (monthValue.isBefore(purchase.event.year_month)) {
      return total;
    }
    return total.add(purchase.realEstateTaxMonthly);
  }, Money.of(0));
  const eventAmount = expandedLifeEvents.reduce((total, event) => {
    if (isRetirementBonus(event.category as LifeEventCategory)) {
      return total;
    }
    if (!monthValue.equals(event.year_month)) {
      return total;
    }
    return total.add(Money.of(event.amount));
  }, Money.of(0));
  const totalExpense = baseExpense.add(rentExpense).add(mortgageExpense).add(realEstateTax);

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
): {
  nextState: BalanceState;
  monthWithBalances: SimulationResultDomain["months"][number];
} => {
  let { cashBalance, investmentBalance, depletionYearMonth } = state;

  const netCashflow = monthly.totalIncome.minus(monthly.totalExpense).add(monthly.eventAmount);
  cashBalance = cashBalance.add(netCashflow);
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
      totalIncome: monthly.totalIncome,
      totalExpense: monthly.totalExpense,
      eventAmount: monthly.eventAmount,
      netCashflow,
      cashBalance,
      investmentBalance,
      totalBalance,
    },
  };
};

export const simulateLifePlan = (input: SimulationInputDomain): SimulationResultDomain => {
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
  const mortgagePayments = input.mortgages.map((mortgage) => ({
    mortgage,
    totalMonths: toLoanMonths(mortgage.years),
    monthlyPayment: calculateMortgageMonthlyPayment(mortgage, input.simulationSettings),
  }));

  const context: SimulationContext = {
    input,
    expandedLifeEvents,
    housingPurchases,
    rentals,
    mortgagePayments,
  };
  const monthlyCashFlows = timeline.map((month) => calculateMonthlyCashFlow(context, month));

  const aggregatedAssets = aggregateAssets(input.assets);
  const monthlyReturnRate = aggregatedAssets.returnRate / 12;

  let state: BalanceState = {
    cashBalance: aggregatedAssets.cashBalance,
    investmentBalance: aggregatedAssets.investmentBalance,
    depletionYearMonth: null,
  };
  const monthsWithBalances: SimulationResultDomain["months"] = [];

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
