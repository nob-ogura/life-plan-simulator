import { expect, test } from "./fixtures";

test("display range toggle updates graph and table", async ({ authenticatedPage: page }) => {
  await page.goto("/inputs");

  const familySection = page.locator("details", { hasText: "家族構成" });
  await familySection.getByLabel("本人（年）").fill("1985");
  await familySection.getByLabel("本人（月）").fill("4");
  await familySection.getByLabel("配偶者（年）").fill("1988");
  await familySection.getByLabel("配偶者（月）").fill("7");
  await familySection.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("保存しました。")).toBeVisible();

  const simulationSection = page.locator("details", {
    has: page.getByText("シミュレーション設定", { exact: true }),
  });
  await simulationSection.locator("summary").click();
  await simulationSection.getByLabel("開始オフセット（月）").fill("0");
  await simulationSection.getByLabel("終了年齢").fill("90");
  await simulationSection.getByLabel("単身").fill("65000");
  await simulationSection.getByLabel("配偶者分").fill("130000");
  await simulationSection.getByLabel("諸経費率").fill("1.03");
  await simulationSection.getByLabel("固定資産税率").fill("0.014");
  await simulationSection.getByLabel("評価額掛目").fill("0.7");
  await simulationSection.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("保存しました。")).toBeVisible();

  const incomeSection = page.locator("details", {
    has: page.getByText("収入", { exact: true }),
  });
  await incomeSection.getByText("収入", { exact: true }).click();
  await incomeSection.getByRole("button", { name: "追加" }).click();
  await incomeSection.getByLabel("ラベル").fill("給与");
  await incomeSection.getByLabel("手取り月額").fill("300000");
  await incomeSection.getByLabel("昇給率").fill("0.02");
  await incomeSection.getByLabel("開始年月").fill("2020-04");
  await incomeSection.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("保存しました。")).toBeVisible();

  await page.goto("/");

  const summarySection = page.locator("section", {
    has: page.getByRole("heading", { name: "サマリカード" }),
  });
  const readSummaryValue = async (title: string) => {
    const titleNode = summarySection.getByText(title, { exact: true });
    const card = titleNode.locator("..");
    return (await card.locator("p").nth(1).textContent())?.trim() ?? "";
  };

  const recentCumulative = await expect
    .poll(() => readSummaryValue("累計収支"))
    .not.toBe("--")
    .then(() => readSummaryValue("累計収支"));
  const recentAverage = await readSummaryValue("平均月残高");

  const graphLabel = page.getByText(/グラフ描画エリア/);
  const cashflowSection = page.locator("section", {
    has: page.getByRole("heading", { name: "月次キャッシュフロー表" }),
  });

  const readGraphMonths = async () => {
    const text = await graphLabel.textContent();
    const match = text?.match(/(\d+)ヶ月/);
    expect(match).not.toBeNull();
    return Number(match?.[1] ?? 0);
  };

  const readFirstMonth = async () => {
    const firstRow = cashflowSection.locator("div.divide-y > div").first();
    return (await firstRow.locator("div").first().textContent())?.trim() ?? "";
  };

  const recentMonths = await readGraphMonths();
  expect(recentMonths).toBe(60);
  const recentFirstMonth = await readFirstMonth();

  await page.getByRole("button", { name: "全期間" }).click();

  const allCumulative = await expect
    .poll(() => readSummaryValue("累計収支"))
    .not.toBe(recentCumulative)
    .then(() => readSummaryValue("累計収支"));
  const allAverage = await expect
    .poll(() => readSummaryValue("平均月残高"))
    .not.toBe(recentAverage)
    .then(() => readSummaryValue("平均月残高"));
  const allMonths = await expect
    .poll(readGraphMonths)
    .toBeGreaterThan(recentMonths)
    .then(() => readGraphMonths());
  const allFirstMonth = await expect
    .poll(readFirstMonth)
    .not.toBe(recentFirstMonth)
    .then(() => readFirstMonth());

  await page.getByRole("button", { name: "直近5年" }).click();

  await expect.poll(() => readSummaryValue("累計収支")).toBe(recentCumulative);
  await expect.poll(() => readSummaryValue("平均月残高")).toBe(recentAverage);
  const recentMonthsAgain = await expect
    .poll(readGraphMonths)
    .toBe(60)
    .then(() => readGraphMonths());
  const recentFirstMonthAgain = await expect
    .poll(readFirstMonth)
    .toBe(recentFirstMonth)
    .then(() => readFirstMonth());
  expect(allMonths).toBeGreaterThan(recentMonthsAgain);
  expect(allFirstMonth).not.toBe(recentFirstMonthAgain);
  expect(allCumulative).not.toBe(recentCumulative);
  expect(allAverage).not.toBe(recentAverage);
});
