import type { CreateMortgageRequest } from "@/features/inputs/mortgages/commands/create-mortgage/request";
import type { CreateRentalRequest } from "@/features/inputs/rentals/commands/create-rental/request";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import type { Tables } from "@/types/supabase";

import type { HousingSectionInput, HousingSectionPayload } from "./schema";

const toNumberInput = (value?: number | null) => (value == null ? "" : String(value));

export const buildHousingSectionDefaults = (
  mortgages: Array<Tables<"mortgages">>,
  rentals: Array<Tables<"rentals">>,
): HousingSectionInput => ({
  mortgages: mortgages.map((mortgage) => ({
    id: mortgage.id,
    principal: toNumberInput(mortgage.principal),
    annual_rate: toNumberInput(mortgage.annual_rate),
    years: toNumberInput(mortgage.years),
    start_year_month: mortgage.start_year_month
      ? YearMonth.toYearMonthStringFromInput(mortgage.start_year_month)
      : "",
    building_price: toNumberInput(mortgage.building_price),
    land_price: toNumberInput(mortgage.land_price),
    down_payment: toNumberInput(mortgage.down_payment),
  })),
  rentals: rentals.map((rental) => ({
    id: rental.id,
    rent_monthly: toNumberInput(rental.rent_monthly),
    start_year_month: rental.start_year_month
      ? YearMonth.toYearMonthStringFromInput(rental.start_year_month)
      : "",
    end_year_month: rental.end_year_month
      ? YearMonth.toYearMonthStringFromInput(rental.end_year_month)
      : "",
  })),
});

export const toHousingPayloads = (
  value: HousingSectionPayload,
): {
  mortgages: CreateMortgageRequest[];
  rentals: CreateRentalRequest[];
} => ({
  mortgages: value.mortgages.map((mortgage) => ({
    principal: mortgage.principal,
    annual_rate: mortgage.annual_rate,
    years: mortgage.years,
    start_year_month: YearMonth.toMonthStartDateFromInput(mortgage.start_year_month),
    building_price: mortgage.building_price,
    land_price: mortgage.land_price,
    down_payment: mortgage.down_payment,
  })),
  rentals: value.rentals.map((rental) => ({
    rent_monthly: rental.rent_monthly,
    start_year_month: YearMonth.toMonthStartDateFromInput(rental.start_year_month),
    end_year_month: rental.end_year_month
      ? YearMonth.toMonthStartDateFromInput(rental.end_year_month)
      : null,
  })),
});
