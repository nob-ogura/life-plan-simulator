import { expect, test } from "@playwright/test";

test("unauthenticated users are redirected to login", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Log in to continue" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with GitHub" })).toBeVisible();
});

test("family section accepts input and updates summary", async ({ page }) => {
  const email = `e2e+family-${Date.now()}@example.com`;
  await page.request.post("/__e2e/login", { data: { email } });

  await page.goto("/inputs");

  const familySection = page.locator("details", { hasText: "家族構成" });

  await expect(familySection.getByText("子どもの登録はありません。")).toBeVisible();

  await familySection.getByLabel("本人（年）").fill("1985");
  await familySection.getByLabel("本人（月）").fill("4");
  await familySection.getByLabel("配偶者（年）").fill("1988");
  await familySection.getByLabel("配偶者（月）").fill("7");

  await familySection.getByRole("button", { name: "追加" }).click();
  await familySection.getByLabel("ラベル").fill("第一子");
  await familySection.getByLabel("出生年月").fill("2015-04");

  await familySection.getByRole("button", { name: "保存" }).click();

  await expect(page.getByText("保存しました。")).toBeVisible();
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

test("income section accepts input and updates summary", async ({ page }) => {
  const email = `e2e+income-${Date.now()}@example.com`;
  await page.request.post("/__e2e/login", { data: { email } });

  await page.goto("/inputs");

  const incomeSection = page.locator("details", {
    has: page.getByText("収入", { exact: true }),
  });

  await incomeSection.getByText("収入", { exact: true }).click();

  await expect(incomeSection.getByText("収入ストリームの登録はありません。")).toBeVisible();

  await incomeSection.getByRole("button", { name: "追加" }).click();
  await incomeSection.getByLabel("ラベル").fill("給与");
  await incomeSection.getByLabel("手取り月額").fill("300000");
  await incomeSection.getByLabel("昇給率").fill("0.02");
  await incomeSection.getByLabel("開始年月").fill("2020-04");

  await incomeSection.getByRole("button", { name: "保存" }).click();

  await expect(page.getByText("保存しました。")).toBeVisible();
  await expect(incomeSection.getByText("収入ストリームの登録はありません。")).toBeHidden();

  await expect(
    incomeSection.locator("dt", { hasText: "収入ストリーム" }).locator("..").locator("dd"),
  ).toHaveText("1件");
  await expect(
    incomeSection.locator("dt", { hasText: "主な収入ラベル" }).locator("..").locator("dd"),
  ).toHaveText("給与");
});

test("bonus section accepts input and updates summary", async ({ page }) => {
  const email = `e2e+bonus-${Date.now()}@example.com`;
  await page.request.post("/__e2e/login", { data: { email } });

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

  await expect(page.getByText("保存しました。")).toBeVisible();

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

  await expect(page.getByText("保存しました。")).toBeVisible();
  await expect(
    bonusSection.locator("dt", { hasText: "ボーナス設定" }).locator("..").locator("dd"),
  ).toHaveText("1件");
  await expect(
    bonusSection.locator("dt", { hasText: "対象ストリーム" }).locator("..").locator("dd"),
  ).toHaveText("給与");
});

test("expense section accepts input and updates summary", async ({ page }) => {
  const email = `e2e+expense-${Date.now()}@example.com`;
  await page.request.post("/__e2e/login", { data: { email } });

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
  await expenseSection.getByLabel("カテゴリ").fill("生活費");
  await expenseSection.getByLabel("開始年月").fill("2020-04");
  await expenseSection.getByLabel("終了年月").fill("2040-03");

  await expenseSection.getByRole("button", { name: "保存" }).click();

  await expect(page.getByText("保存しました。")).toBeVisible();
  await expect(expenseSection.getByText("支出項目の登録はありません。")).toBeHidden();

  await expect(
    expenseSection.locator("dt", { hasText: "支出項目" }).locator("..").locator("dd"),
  ).toHaveText("1件");
  await expect(
    expenseSection.locator("dt", { hasText: "主な支出ラベル" }).locator("..").locator("dd"),
  ).toHaveText("生活費");
});

test("housing section accepts input and updates summary", async ({ page }) => {
  const email = `e2e+housing-${Date.now()}@example.com`;
  await page.request.post("/__e2e/login", { data: { email } });

  await page.goto("/inputs");

  const housingSection = page.locator("details", {
    has: page.getByText("住宅", { exact: true }),
  });

  await housingSection.getByText("住宅", { exact: true }).click();

  await expect(housingSection.getByText("住宅購入の登録はありません。")).toBeVisible();
  await expect(housingSection.getByText("賃貸の登録はありません。")).toBeVisible();

  await housingSection.getByRole("button", { name: "追加" }).first().click();
  await housingSection.getByLabel("建物価格").fill("25000000");
  await housingSection.getByLabel("土地価格").fill("12000000");
  await housingSection.getByLabel("頭金").fill("5000000");
  await housingSection.getByLabel("返済年数").fill("35");
  await housingSection.getByLabel("金利").fill("0.015");
  await housingSection.getByLabel("借入額").fill("32000000");
  await housingSection.getByLabel("借入開始年月").fill("2025-04");

  await housingSection.getByRole("button", { name: "追加" }).nth(1).click();
  await housingSection.getByLabel("家賃（月額）").fill("120000");
  await housingSection.getByLabel("開始年月", { exact: true }).fill("2025-04");
  await housingSection.getByLabel("終了年月").fill("2030-03");

  await housingSection.getByRole("button", { name: "保存" }).click();

  await expect(page.getByText("保存しました。")).toBeVisible();
  await expect(housingSection.getByText("住宅購入の登録はありません。")).toBeHidden();
  await expect(housingSection.getByText("賃貸の登録はありません。")).toBeHidden();

  await expect(
    housingSection.locator("dt", { hasText: "住宅購入" }).locator("..").locator("dd"),
  ).toHaveText("1件");
  await expect(
    housingSection.locator("dt", { hasText: "賃貸" }).locator("..").locator("dd"),
  ).toHaveText("1件");
});
