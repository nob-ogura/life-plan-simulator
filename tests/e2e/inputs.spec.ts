import { expect, expectToast, test } from "./fixtures";

test("unauthenticated users are redirected to login", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Log in to continue" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with GitHub" })).toBeVisible();
});

test("family section accepts input and updates summary", async ({ authenticatedPage: page }) => {
  await page.goto("/inputs");

  const familySection = page.locator("details", { hasText: "家族構成" });
  await familySection.locator("summary").click();

  await expect(familySection.getByText("子どもの登録はありません。")).toBeVisible();

  await familySection.getByLabel("本人（年）").fill("1985");
  await familySection.getByLabel("本人（月）").fill("4");
  await familySection.getByLabel("配偶者（年）").fill("1988");
  await familySection.getByLabel("配偶者（月）").fill("7");

  await familySection.getByRole("button", { name: "追加" }).click();
  await familySection.getByLabel("ラベル").fill("第一子");
  await familySection.getByLabel("出生年月").fill("2015-04");

  await familySection.getByRole("button", { name: "保存" }).click();

  await expectToast(page, "保存しました。");
  await expect(familySection.getByText("子どもの登録はありません。")).toBeHidden();

  await expect(
    familySection.locator("dt", { hasText: "本人" }).locator("..").locator("dd"),
  ).toHaveText("1985年04月");
  await expect(
    familySection.locator("dt", { hasText: "配偶者" }).locator("..").locator("dd"),
  ).toHaveText("1988年07月");
  await expect(
    familySection.locator("dt", { hasText: "子ども" }).locator("..").locator("dd"),
  ).toHaveText("1人");
});

test("income section accepts input and updates summary", async ({ authenticatedPage: page }) => {
  await page.goto("/inputs");

  const incomeSection = page.locator("details", {
    has: page.getByText("収入", { exact: true }),
  });

  await incomeSection.getByText("収入", { exact: true }).click();

  await expect(incomeSection.getByText("定期収入の登録はありません。")).toBeVisible();

  await incomeSection.getByRole("button", { name: "追加" }).click();
  await incomeSection.getByLabel("ラベル").fill("給与");
  await incomeSection.getByLabel("手取り月額").fill("300000");
  await incomeSection.getByLabel("昇給率").fill("0.02");
  await incomeSection.getByLabel("開始年月").fill("2020-04");

  await incomeSection.getByRole("button", { name: "保存" }).click();

  await expectToast(page, "保存しました。");
  await expect(incomeSection.getByText("定期収入の登録はありません。")).toBeHidden();

  await expect(
    incomeSection.locator("dt", { hasText: "定期収入" }).locator("..").locator("dd"),
  ).toHaveText("1件");
  await expect(
    incomeSection.locator("dt", { hasText: "主な収入ラベル" }).locator("..").locator("dd"),
  ).toHaveText("給与");
});

test("bonus section accepts input and updates summary", async ({ authenticatedPage: page }) => {
  await page.goto("/inputs");

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

  await expectToast(page, "保存しました。");

  const bonusSection = page.locator("details", {
    has: page.getByText("ボーナス", { exact: true }),
  });

  await bonusSection.getByText("ボーナス", { exact: true }).click();

  await expect(bonusSection.getByText("ボーナス 1")).toBeVisible();
  await expect(bonusSection.getByLabel("収入ラベル")).toHaveValue("給与");

  await bonusSection.getByLabel("6月").check();
  await bonusSection.getByLabel("12月").check();
  await bonusSection.getByLabel("ボーナス金額", { exact: true }).fill("500000");
  await bonusSection.getByLabel("変化年月").fill("2030-04");
  await bonusSection.getByLabel("変化後ボーナス金額").fill("600000");

  await bonusSection.getByRole("button", { name: "保存" }).click();

  await expectToast(page, "保存しました。");
  await expect(
    bonusSection.locator("dt", { hasText: "ボーナス設定" }).locator("..").locator("dd"),
  ).toHaveText("1件");
  await expect(
    bonusSection.locator("dt", { hasText: "対象ストリーム" }).locator("..").locator("dd"),
  ).toHaveText("給与");
});

test("expense section accepts input and updates summary", async ({ authenticatedPage: page }) => {
  await page.goto("/inputs");

  const expenseSection = page.locator("details", {
    has: page.getByText("支出", { exact: true }),
  });

  await expenseSection.getByText("支出", { exact: true }).click();

  await expect(expenseSection.getByText("支出項目の登録はありません。")).toBeVisible();

  await expenseSection.getByRole("button", { name: "追加" }).click();
  await expenseSection.getByLabel("ラベル").fill("生活費");
  await expenseSection.getByLabel("月額").fill("180000");
  await expenseSection.getByLabel("インフレ率").fill("0.01");
  await expenseSection.getByLabel("カテゴリ").selectOption({ label: "生活費" });
  await expenseSection.getByLabel("開始年月").fill("2020-04");
  await expenseSection.getByLabel("終了年月").fill("2040-03");

  await expenseSection.getByRole("button", { name: "保存" }).click();

  await expectToast(page, "保存しました。");
  await expect(expenseSection.getByText("支出項目の登録はありません。")).toBeHidden();

  await expect(
    expenseSection.locator("dt", { hasText: "支出項目" }).locator("..").locator("dd"),
  ).toHaveText("1件", { timeout: 10_000 });
  await expect(
    expenseSection.locator("dt", { hasText: "主な支出ラベル" }).locator("..").locator("dd"),
  ).toHaveText("生活費", { timeout: 10_000 });
});

test("housing section accepts input and updates summary", async ({ authenticatedPage: page }) => {
  await page.goto("/inputs");

  const housingSection = page.locator("details", {
    has: page.getByText("住宅", { exact: true }),
  });

  await housingSection.locator("summary").click();

  await expect(housingSection.getByText("住宅購入の登録はありません。")).toBeVisible();
  await expect(housingSection.getByText("賃貸の登録はありません。")).toBeVisible();

  await housingSection.getByRole("button", { name: "追加" }).nth(1).click();
  await housingSection.getByLabel("建物価格").fill("25000000");
  await housingSection.getByLabel("土地価格").fill("12000000");
  await housingSection.getByLabel("頭金").fill("5000000");
  await housingSection.getByLabel("返済年数").fill("35");
  await housingSection.getByLabel("金利").fill("0.015");
  await housingSection.getByLabel("借入額").fill("32000000");
  await housingSection.getByLabel("借入開始年月").fill("2025-04");

  await housingSection.getByRole("button", { name: "追加" }).first().click();
  await housingSection.getByLabel("家賃（月額）").fill("120000");
  await housingSection.getByLabel("開始年月", { exact: true }).fill("2025-04");
  await housingSection.getByLabel("終了年月").fill("2030-03");

  await housingSection.getByRole("button", { name: "保存" }).click();

  await expectToast(page, "保存しました。");
  await expect(housingSection.getByText("住宅購入の登録はありません。")).toBeHidden();
  await expect(housingSection.getByText("賃貸の登録はありません。")).toBeHidden();

  await expect(
    housingSection.locator("dt", { hasText: "住宅購入" }).locator("..").locator("dd"),
  ).toHaveText("1件");
  await expect(
    housingSection.locator("dt", { hasText: "賃貸" }).locator("..").locator("dd"),
  ).toHaveText("1件");
});

test("life event section accepts input and updates summary", async ({
  authenticatedPage: page,
}) => {
  const timestamp = Date.now();
  const label = `留学費用-${timestamp}`;

  await page.goto("/inputs");

  const lifeEventSection = page.locator("details", {
    has: page.getByText("ライフイベント", { exact: true }),
  });

  await lifeEventSection.getByText("ライフイベント", { exact: true }).click();

  await expect(lifeEventSection.getByText("登録済みのイベントはありません。")).toBeVisible();

  await lifeEventSection.getByRole("button", { name: "イベント追加" }).click();

  const modal = page.getByRole("dialog");

  await modal.getByLabel("ラベル").fill(label);
  await modal.getByLabel("金額").fill("750000");
  await modal.getByLabel("発生年月").fill("2030-04");
  await modal.getByLabel("カテゴリ").selectOption({ value: "travel" });
  await modal.getByLabel("繰り返し間隔（年）").fill("1");
  await modal.getByLabel("停止回数").fill("3");

  await modal.getByRole("button", { name: "保存" }).click();

  await expectToast(page, "保存しました。");
  await expect(lifeEventSection.getByText("登録済みのイベントはありません。")).toBeHidden();

  const eventList = lifeEventSection.locator("div.grid.gap-3");

  await expect(eventList.getByText(label, { exact: true })).toBeVisible();
  await expect(eventList.getByText("旅行 · 2030年04月")).toBeVisible();
  await expect(eventList.getByText("750,000円")).toBeVisible();
  await expect(eventList.getByText("繰り返し: 1年ごと（停止: 3回）")).toBeVisible();

  await expect(
    lifeEventSection.locator("dt", { hasText: "イベント数" }).locator("..").locator("dd"),
  ).toHaveText("1件");
  await expect(
    lifeEventSection.locator("dt", { hasText: "主なイベント" }).locator("..").locator("dd"),
  ).toHaveText(label);
});

test("retirement bonus section accepts input and updates summary", async ({
  authenticatedPage: page,
}) => {
  await page.goto("/inputs");

  const retirementSection = page.locator("details", {
    has: page.getByText("退職金", { exact: true }),
  });

  await retirementSection.locator("summary").click();

  await retirementSection.getByLabel("金額").fill("1500000");
  await retirementSection.getByLabel("支給年月").fill("2045-03");

  await retirementSection.getByRole("button", { name: "保存" }).click();

  await expectToast(page, "保存しました。");
  await expect(
    retirementSection.locator("dt", { hasText: "退職金レコード" }).locator("..").locator("dd"),
  ).toHaveText("1件");
  await expect(
    retirementSection.locator("dt", { hasText: "登録名" }).locator("..").locator("dd"),
  ).toHaveText("退職金");
});

test("pension section accepts input and updates summary", async ({ authenticatedPage: page }) => {
  await page.goto("/inputs");

  const pensionSection = page.locator("details", {
    has: page.getByText("年金開始年齢", { exact: true }),
  });

  await pensionSection.locator("summary").click();
  await pensionSection.getByLabel("年金開始年齢").fill("65");

  await pensionSection.getByRole("button", { name: "保存" }).click();

  await expectToast(page, "保存しました。");
  await expect(
    pensionSection.locator("dt", { hasText: "年金開始年齢" }).locator("..").locator("dd"),
  ).toHaveText("65歳");
  await expect(pensionSection.getByText("開始年齢 65歳")).toBeVisible();
});

test("asset section accepts input and updates summary", async ({ authenticatedPage: page }) => {
  await page.goto("/inputs");

  const assetSection = page.locator("details", {
    has: page.getByText("投資設定", { exact: true }),
  });

  await assetSection.locator("summary").click();

  await assetSection.getByLabel("現金残高").fill("1000000");
  await assetSection.getByLabel("運用残高").fill("5000000");
  await assetSection.getByLabel("運用利回り").fill("0.03");

  await assetSection.getByRole("button", { name: "保存" }).click();

  await expectToast(page, "保存しました。");
  await expect(
    assetSection.locator("dt", { hasText: "現金残高" }).locator("..").locator("dd"),
  ).toHaveText("1,000,000円");
  await expect(
    assetSection.locator("dt", { hasText: "運用残高" }).locator("..").locator("dd"),
  ).toHaveText("5,000,000円");
  await expect(
    assetSection.locator("dt", { hasText: "運用利回り" }).locator("..").locator("dd"),
  ).toHaveText("0.03");
});

test("simulation settings section accepts input and updates summary", async ({
  authenticatedPage: page,
}) => {
  await page.goto("/inputs");

  const simulationSection = page.locator("details", {
    has: page.getByText("シミュレーション設定", { exact: true }),
  });

  await simulationSection.locator("summary").click();

  await simulationSection.getByLabel("開始オフセット（月）").fill("2");
  await simulationSection.getByLabel("終了年齢").fill("90");
  await simulationSection.getByLabel("単身").fill("70000");
  await simulationSection.getByLabel("配偶者分").fill("140000");
  await simulationSection.getByLabel("諸経費率").fill("1.05");
  await simulationSection.getByLabel("固定資産税率").fill("0.014");
  await simulationSection.getByLabel("評価額掛目").fill("0.8");

  await simulationSection.getByRole("button", { name: "保存" }).click();

  await expectToast(page, "保存しました。");
  await expect(
    simulationSection.locator("dt", { hasText: "終了年齢" }).locator("..").locator("dd"),
  ).toHaveText("90歳");
  await expect(
    simulationSection.locator("dt", { hasText: "年金月額（単身）" }).locator("..").locator("dd"),
  ).toHaveText("70,000円");
  await expect(
    simulationSection.locator("dt", { hasText: "年金月額（配偶者）" }).locator("..").locator("dd"),
  ).toHaveText("140,000円");
});
