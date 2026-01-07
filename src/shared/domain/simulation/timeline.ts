import { BirthDate } from "@/shared/domain/value-objects/BirthDate";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import type { SimulationProfile, YearMonthString } from "./types";

export type TimelineMonth = {
  yearMonth: YearMonthString;
  age: number;
  spouseAge: number | null;
};

export const yearMonthToElapsedMonths = (yearMonth: YearMonthString): number =>
  YearMonth.create(yearMonth).toElapsedMonths();

export const elapsedMonthsToYearMonth = (elapsedMonths: number): YearMonthString =>
  YearMonth.fromElapsedMonths(elapsedMonths).toString();

export const addMonths = (yearMonth: YearMonthString, deltaMonths: number): YearMonthString =>
  YearMonth.create(yearMonth).addMonths(deltaMonths).toString();

export const generateMonthlyTimeline = ({
  currentYearMonth,
  startOffsetMonths,
  endAge = 100,
  profile,
}: {
  currentYearMonth: YearMonthString;
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

  const startYearMonth = YearMonth.create(currentYearMonth).addMonths(startOffsetMonths);
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
    const yearMonthValue = yearMonth.toString();
    const age = birthDate.ageAt(yearMonth);
    const spouseAge = spouseBirthDate ? spouseBirthDate.ageAt(yearMonth) : null;

    timeline.push({ yearMonth: yearMonthValue, age, spouseAge });
  }

  return timeline;
};
