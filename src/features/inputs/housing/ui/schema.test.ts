import { describe, expect, it } from "vitest";

import { HousingSectionSchema } from "@/features/inputs/housing/ui/schema";

const findIssueMessage = (
  issues: Array<{ path: Array<PropertyKey>; message: string }>,
  path: string,
) => issues.find((issue) => issue.path.map(String).join(".") === path)?.message;

describe("housing section schema", () => {
  it("requires housing purchase mandatory fields with Japanese messages", () => {
    const result = HousingSectionSchema.safeParse({
      mortgages: [
        {
          id: "mortgage-1",
          principal: "",
          annual_rate: "",
          years: "",
          start_year_month: "",
          building_price: "",
          land_price: "",
          down_payment: "",
          target_rental_id: "",
        },
      ],
      rentals: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, "mortgages.0.building_price")).toBe(
        "必須項目です",
      );
      expect(findIssueMessage(result.error.issues, "mortgages.0.land_price")).toBe("必須項目です");
      expect(findIssueMessage(result.error.issues, "mortgages.0.down_payment")).toBe(
        "必須項目です",
      );
      expect(findIssueMessage(result.error.issues, "mortgages.0.years")).toBe("必須項目です");
    }
  });
});
