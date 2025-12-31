import { expect, test } from "./fixtures";

const formatAmount = (value: number) =>
  `${new Intl.NumberFormat("ja-JP").format(Math.round(value))}円`;

const monthIndex = (yearMonth: string) => {
  const [year, month] = yearMonth.split("-").map((part) => Number(part));
  return year * 12 + (month - 1);
};

test("repeating life event stops after the configured condition", async ({
  authenticatedPage: page,
}) => {
  const userId = (page as typeof page & { e2eUserId?: string }).e2eUserId;
  if (!userId) {
    throw new Error("Missing E2E user id for seed request.");
  }

  const seedResponse = await page.request.post("/__e2e/seed", {
    data: { scenario: "repeat-stop", userId },
  });
  const fallbackResponse =
    seedResponse.status() === 404
      ? await page.request.post("/e2e/seed", {
          data: { scenario: "repeat-stop", userId },
        })
      : seedResponse;

  if (!fallbackResponse.ok()) {
    const detail = await fallbackResponse.text();
    throw new Error(
      `E2E seed failed: ${fallbackResponse.status()} ${fallbackResponse.statusText()} ${detail}`,
    );
  }
  const seed = await fallbackResponse.json();

  await page.goto("/");

  const cashflowSection = page.locator("section", {
    has: page.getByRole("heading", { name: "月次キャッシュフロー表" }),
  });
  const scrollContainer = cashflowSection.getByTestId("cashflow-scroll");
  await expect(scrollContainer).toBeVisible();

  const scrollToYearMonth = async (yearMonth: string) => {
    const index = monthIndex(yearMonth) - monthIndex(seed.startYearMonth);
    const scrollTop = Math.max(0, index) * 44;
    await scrollContainer.evaluate((node, top) => {
      node.scrollTop = top;
    }, scrollTop);
  };

  const netFor = (yearMonth: string) => {
    const row = cashflowSection
      .locator("div.divide-y > div")
      .filter({ hasText: yearMonth })
      .first();
    return row.locator("div").nth(3);
  };

  const expectedEventAmount = formatAmount(seed.eventAmount);
  const expectedZero = formatAmount(0);

  await scrollToYearMonth(seed.eventYearMonth);
  await expect(netFor(seed.eventYearMonth)).toHaveText(expectedEventAmount);

  await scrollToYearMonth(seed.afterStopYearMonth);
  await expect(netFor(seed.afterStopYearMonth)).toHaveText(expectedZero);
});
