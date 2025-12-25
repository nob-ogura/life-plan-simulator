import type { SimulationProfile, YearMonth } from "./types";

export type TimelineMonth = {
  yearMonth: YearMonth;
  age: number;
  spouseAge: number | null;
};

const parseYearMonth = (yearMonth: YearMonth): { year: number; month: number } => {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) {
    throw new Error(`Invalid year-month format: ${yearMonth}`);
  }
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month in year-month: ${yearMonth}`);
  }
  return { year, month };
};

export const yearMonthToElapsedMonths = (yearMonth: YearMonth): number => {
  const { year, month } = parseYearMonth(yearMonth);
  return year * 12 + (month - 1);
};

export const elapsedMonthsToYearMonth = (elapsedMonths: number): YearMonth => {
  const year = Math.floor(elapsedMonths / 12);
  const monthIndex = elapsedMonths - year * 12;
  const month = monthIndex + 1;
  const yearText = String(year).padStart(4, "0");
  const monthText = String(month).padStart(2, "0");
  return `${yearText}-${monthText}`;
};

export const addMonths = (yearMonth: YearMonth, deltaMonths: number): YearMonth =>
  elapsedMonthsToYearMonth(yearMonthToElapsedMonths(yearMonth) + deltaMonths);

export const calculateAgeAtYearMonth = (
  yearMonth: YearMonth,
  birthYear: number | null,
  birthMonth: number | null,
): number | null => {
  if (birthYear == null || birthMonth == null) {
    return null;
  }

  const { year, month } = parseYearMonth(yearMonth);
  const hasBirthdayPassed = month >= birthMonth;
  return year - birthYear - (hasBirthdayPassed ? 0 : 1);
};

export const generateMonthlyTimeline = ({
  currentYearMonth,
  startOffsetMonths,
  endAge = 100,
  profile,
}: {
  currentYearMonth: YearMonth;
  startOffsetMonths: number;
  endAge?: number;
  profile: SimulationProfile;
}): TimelineMonth[] => {
  if (profile.birth_year == null || profile.birth_month == null) {
    throw new Error("Profile birth year/month is required to generate timeline.");
  }
  if (profile.birth_month < 1 || profile.birth_month > 12) {
    throw new Error("Profile birth month must be between 1 and 12.");
  }

  const startYearMonth = addMonths(currentYearMonth, startOffsetMonths);
  const startIndex = yearMonthToElapsedMonths(startYearMonth);
  const endIndex = (profile.birth_year + endAge) * 12 + (profile.birth_month - 1);

  if (startIndex > endIndex) {
    return [];
  }

  const timeline: TimelineMonth[] = [];

  for (let index = startIndex; index <= endIndex; index += 1) {
    const yearMonth = elapsedMonthsToYearMonth(index);
    const age = calculateAgeAtYearMonth(yearMonth, profile.birth_year, profile.birth_month);
    if (age == null) {
      continue;
    }
    const spouseAge = calculateAgeAtYearMonth(
      yearMonth,
      profile.spouse_birth_year,
      profile.spouse_birth_month,
    );

    timeline.push({ yearMonth, age, spouseAge });
  }

  return timeline;
};
