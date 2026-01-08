import { BirthDate } from "@/shared/domain/value-objects/BirthDate";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import type { SimulationProfile } from "./types";

export type TimelineMonth = {
  yearMonth: YearMonth;
  age: number;
  spouseAge: number | null;
};

export const yearMonthToElapsedMonths = (yearMonth: YearMonth): number =>
  yearMonth.toElapsedMonths();

export const elapsedMonthsToYearMonth = (elapsedMonths: number): YearMonth =>
  YearMonth.fromElapsedMonths(elapsedMonths);

export const addMonths = (yearMonth: YearMonth, deltaMonths: number): YearMonth =>
  yearMonth.addMonths(deltaMonths);

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

  const birthDate = BirthDate.fromYearMonth(profile.birth_year, profile.birth_month);
  const spouseBirthDate =
    profile.spouse_birth_year != null && profile.spouse_birth_month != null
      ? BirthDate.fromYearMonth(profile.spouse_birth_year, profile.spouse_birth_month)
      : null;

  const startYearMonth = currentYearMonth.addMonths(startOffsetMonths);
  const startIndex = startYearMonth.toElapsedMonths();
  const endIndex = YearMonth.fromParts(
    profile.birth_year + endAge,
    profile.birth_month,
  ).toElapsedMonths();

  if (startIndex > endIndex) {
    return [];
  }

  const timeline: TimelineMonth[] = [];

  for (let index = startIndex; index <= endIndex; index += 1) {
    const yearMonth = YearMonth.fromElapsedMonths(index);
    const age = birthDate.ageAt(yearMonth);
    const spouseAge = spouseBirthDate ? spouseBirthDate.ageAt(yearMonth) : null;

    timeline.push({ yearMonth, age, spouseAge });
  }

  return timeline;
};
