import { expect, expectToast, test } from "./fixtures";

test("settings page reads saved simulation settings", async ({ authenticatedPage: page }) => {
  await page.goto("/settings");

  const startOffset = page.getByLabel("開始オフセット（月）");
  const endAge = page.getByLabel("終了年齢");
  const transactionRate = page.getByLabel("諸経費率");
  const taxRate = page.getByLabel("固定資産税率");
  const evaluationRate = page.getByLabel("評価額掛目");

  await startOffset.fill("3");
  await endAge.fill("90");
  await transactionRate.fill("1.05");
  await taxRate.fill("0.02");
  await evaluationRate.fill("0.8");

  await page.getByRole("button", { name: "保存" }).click();
  await expectToast(page, "保存しました。");

  await page.reload();

  await expect(startOffset).toHaveValue("3");
  await expect(endAge).toHaveValue("90");
  await expect(transactionRate).toHaveValue("1.05");
  await expect(taxRate).toHaveValue("0.02");
  await expect(evaluationRate).toHaveValue("0.8");
});

test("settings page resets values to defaults", async ({ authenticatedPage: page }) => {
  await page.goto("/settings");

  const startOffset = page.getByLabel("開始オフセット（月）");
  const endAge = page.getByLabel("終了年齢");
  const transactionRate = page.getByLabel("諸経費率");
  const taxRate = page.getByLabel("固定資産税率");
  const evaluationRate = page.getByLabel("評価額掛目");

  await startOffset.fill("4");
  await endAge.fill("85");
  await transactionRate.fill("1.2");
  await taxRate.fill("0.03");
  await evaluationRate.fill("0.9");

  await page.getByRole("button", { name: "保存" }).click();
  await expectToast(page, "保存しました。");

  await page.getByRole("button", { name: "初期値に戻す" }).click();
  await expectToast(page, "初期値に戻しました。");

  await expect(startOffset).toHaveValue("0");
  await expect(endAge).toHaveValue("100");
  await expect(transactionRate).toHaveValue("1.03");
  await expect(taxRate).toHaveValue("0.014");
  await expect(evaluationRate).toHaveValue("0.7");
});
