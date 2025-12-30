import { describe, expect, it } from "vitest";

import { AssetFormSchema } from "@/features/inputs/assets/ui/schema";

const findIssueMessage = (
  issues: Array<{ path: Array<PropertyKey>; message: string }>,
  path: string,
) => issues.find((issue) => issue.path.map(String).join(".") === path)?.message;

describe("asset form schema", () => {
  it("requires asset balances with Japanese messages", () => {
    const result = AssetFormSchema.safeParse({
      cash_balance: "",
      investment_balance: "",
      return_rate: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, "cash_balance")).toBe("必須項目です");
      expect(findIssueMessage(result.error.issues, "investment_balance")).toBe("必須項目です");
    }
  });
});
