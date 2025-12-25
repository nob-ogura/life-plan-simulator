import { generateMonthlyTimeline, yearMonthToElapsedMonths } from "./timeline";
import type {
  SimulationIncomeStream,
  SimulationInput,
  SimulationLifeEvent,
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
    const retirementBonus = calculateRetirementBonus(month.yearMonth, input.lifeEvents);
    const totalIncome = incomeFromStreams + pensionIncome + spousePensionIncome + retirementBonus;

    return {
      yearMonth: month.yearMonth,
      age: month.age,
      spouseAge: month.spouseAge,
      totalIncome,
      totalExpense: 0,
      eventAmount: 0,
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
