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
