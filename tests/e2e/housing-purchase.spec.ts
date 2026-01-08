import { Money } from "@/shared/domain/value-objects/Money";
import { expect, test } from "./fixtures";

const formatAmount = (value: number) => Money.of(value).formatYen();

test("housing purchase stops rent in the month before purchase", async ({
  authenticatedPage: page,
}) => {
  const userId = (page as typeof page & { e2eUserId?: string }).e2eUserId;
  if (!userId) {
    throw new Error("Missing E2E user id for seed request.");
  }
  const seedResponse = await page.request.post("/__e2e/seed", {
    data: { scenario: "housing-purchase-stop", userId },
  });

  if (!seedResponse.ok()) {
    const detail = await seedResponse.text();
    throw new Error(
      `E2E seed failed: ${seedResponse.status()} ${seedResponse.statusText()} ${detail}`,
    );
  }
  const seed = await seedResponse.json();

  await page.goto("/");

  const cashflowSection = page.locator("section", {
    has: page.getByRole("heading", { name: "月次キャッシュフロー表" }),
  });
  const scrollContainer = cashflowSection.getByTestId("cashflow-scroll");
  await expect(scrollContainer).toBeVisible();
  await scrollContainer.evaluate((node) => {
    node.scrollTop = 0;
  });

  const expenseFor = (yearMonth: string) => {
    const row = cashflowSection
      .locator("div.divide-y > div")
      .filter({ hasText: yearMonth })
      .first();
    return row.locator("div").nth(2);
  };

  const expectedRent = formatAmount(seed.rentMonthly);
  const expectedZero = formatAmount(0);

  await expect(expenseFor(seed.stopYearMonth)).toHaveText(expectedRent);
  await expect(expenseFor(seed.purchaseYearMonth)).toHaveText(expectedZero);
});
