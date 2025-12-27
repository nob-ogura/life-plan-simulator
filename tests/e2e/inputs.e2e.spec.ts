import { expect, type Page, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/types/supabase";

import {
  assertSupabaseEnv,
  cleanupUserData,
  createAdminClient,
  createTestUser,
  hasSupabaseEnv,
} from "../integration/support/supabase";
import { createSupabaseAuthCookies } from "./support/supabase-auth";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const shouldRun = hasSupabaseEnv;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForRecord = async (
  admin: SupabaseClient<Database>,
  table: "profiles" | "simulation_settings",
  userId: string,
) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data, error } = await admin
      .from(table)
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return;
    }

    await sleep(200);
  }

  throw new Error(`Timed out waiting for ${table} record for user ${userId}`);
};

const waitForExpense = async (admin: SupabaseClient<Database>, userId: string, label: string) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data, error } = await admin
      .from("expenses")
      .select("id")
      .eq("user_id", userId)
      .eq("label", label)
      .limit(1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      return;
    }

    await sleep(200);
  }

  throw new Error(`Timed out waiting for expenses for user ${userId}`);
};

const ensureDefaultRecords = async (admin: SupabaseClient<Database>, userId: string) => {
  await Promise.all([
    waitForRecord(admin, "profiles", userId),
    waitForRecord(admin, "simulation_settings", userId),
  ]);
};

const openSection = async (page: Page, title: string) => {
  const section = page
    .locator("details")
    .filter({ has: page.getByText(title, { exact: true }) })
    .first();

  await expect(section).toBeVisible();

  const isOpen = await section.evaluate((element) => element.hasAttribute("open"));
  if (!isOpen) {
    await section.locator("summary").click();
  }

  return section;
};

test.describe("Inputs UI E2E", () => {
  test.skip(
    !shouldRun,
    "Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or SUPABASE_SECRET_KEY",
  );

  let admin: SupabaseClient<Database>;

  test.beforeAll(() => {
    assertSupabaseEnv();
    admin = createAdminClient();
  });

  test("入力→保存→再取得が成功する", async ({ page }) => {
    const user = await createTestUser(admin, "inputs-e2e");

    try {
      await ensureDefaultRecords(admin, user.id);
      const cookies = await createSupabaseAuthCookies({
        baseURL,
        email: user.email,
        password: user.password,
      });
      await page.context().addCookies(cookies);

      await page.goto("/inputs");
      await expect(page.getByRole("heading", { name: "入力データの登録" })).toBeVisible();

      const familySection = await openSection(page, "家族構成");
      await familySection.getByLabel("本人（年）").fill("1985");
      await familySection.getByLabel("本人（月）").fill("4");
      await familySection.getByLabel("配偶者（年）").fill("1987");
      await familySection.getByLabel("配偶者（月）").fill("9");
      await familySection.getByRole("button", { name: "保存" }).click();
      await expect(page.getByText("保存しました。")).toBeVisible();

      const incomeSection = await openSection(page, "収入");
      await incomeSection.getByRole("button", { name: "追加" }).click();
      await incomeSection.getByLabel("ラベル").fill("給与");
      await incomeSection.getByLabel("手取り月額").fill("350000");
      await incomeSection.getByLabel("昇給率").fill("0.02");
      await incomeSection.getByLabel("開始年月").fill("2024-04");
      await incomeSection.getByLabel("終了年月").fill("2050-03");
      await incomeSection.getByRole("button", { name: "保存" }).click();
      await expect(page.getByText("保存しました。")).toBeVisible();

      const expenseSection = await openSection(page, "支出");
      await expenseSection.getByRole("button", { name: "追加" }).click();
      await expenseSection.getByLabel("ラベル").fill("生活費");
      await expenseSection.getByLabel("月額").fill("200000");
      await expenseSection.getByLabel("インフレ率").fill("0.01");
      await expenseSection.getByLabel("カテゴリ").fill("生活費");
      await expenseSection.getByLabel("開始年月").fill("2024-04");
      await expenseSection.getByLabel("終了年月").fill("2040-03");
      await expenseSection.getByRole("button", { name: "保存" }).click();
      await expect(page.getByText("保存しました。")).toBeVisible();
      await waitForExpense(admin, user.id, "生活費");

      const retirementSection = await openSection(page, "退職金");
      await retirementSection.getByLabel("金額").fill("2000000");
      await retirementSection.getByLabel("支給年月").fill("2045-03");
      await retirementSection.getByRole("button", { name: "保存" }).click();
      await expect(page.getByText("保存しました。")).toBeVisible();

      const simulationSection = await openSection(page, "シミュレーション設定");
      await simulationSection.getByLabel("開始オフセット（月）").fill("1");
      await simulationSection.getByLabel("終了年齢").fill("95");
      await simulationSection.getByLabel("単身").fill("70000");
      await simulationSection.getByLabel("配偶者分").fill("120000");
      await simulationSection.getByLabel("諸経費率").fill("1.05");
      await simulationSection.getByLabel("固定資産税率").fill("0.015");
      await simulationSection.getByLabel("評価額掛目").fill("0.65");
      await simulationSection.getByRole("button", { name: "保存" }).click();
      await expect(page.getByText("保存しました。")).toBeVisible();

      await page.reload();
      await expect(page.getByRole("heading", { name: "入力データの登録" })).toBeVisible();

      const familyAfter = await openSection(page, "家族構成");
      await expect(familyAfter.getByLabel("本人（年）")).toHaveValue("1985");
      await expect(familyAfter.getByLabel("本人（月）")).toHaveValue("4");
      await expect(familyAfter.getByLabel("配偶者（年）")).toHaveValue("1987");
      await expect(familyAfter.getByLabel("配偶者（月）")).toHaveValue("9");

      const incomeAfter = await openSection(page, "収入");
      await expect(incomeAfter.getByLabel("ラベル")).toHaveValue("給与");
      await expect(incomeAfter.getByLabel("手取り月額")).toHaveValue("350000");
      await expect(incomeAfter.getByLabel("昇給率")).toHaveValue("0.02");
      await expect(incomeAfter.getByLabel("開始年月")).toHaveValue("2024-04");
      await expect(incomeAfter.getByLabel("終了年月")).toHaveValue("2050-03");

      const expenseAfter = await openSection(page, "支出");
      await expect(expenseAfter.getByLabel("ラベル")).toHaveValue("生活費");
      await expect(expenseAfter.getByLabel("月額")).toHaveValue("200000");
      await expect(expenseAfter.getByLabel("インフレ率")).toHaveValue("0.01");
      await expect(expenseAfter.getByLabel("カテゴリ")).toHaveValue("生活費");
      await expect(expenseAfter.getByLabel("開始年月")).toHaveValue("2024-04");
      await expect(expenseAfter.getByLabel("終了年月")).toHaveValue("2040-03");

      const retirementAfter = await openSection(page, "退職金");
      await expect(retirementAfter.getByLabel("金額")).toHaveValue("2000000");
      await expect(retirementAfter.getByLabel("支給年月")).toHaveValue("2045-03");

      const simulationAfter = await openSection(page, "シミュレーション設定");
      await expect(simulationAfter.getByLabel("開始オフセット（月）")).toHaveValue("1");
      await expect(simulationAfter.getByLabel("終了年齢")).toHaveValue("95");
      await expect(simulationAfter.getByLabel("単身")).toHaveValue("70000");
      await expect(simulationAfter.getByLabel("配偶者分")).toHaveValue("120000");
      await expect(simulationAfter.getByLabel("諸経費率")).toHaveValue("1.05");
      await expect(simulationAfter.getByLabel("固定資産税率")).toHaveValue("0.015");
      await expect(simulationAfter.getByLabel("評価額掛目")).toHaveValue("0.65");
    } finally {
      await cleanupUserData(admin, user.id);
      await admin.auth.admin.deleteUser(user.id);
    }
  });

  test("必須項目が未入力の場合に保存できない", async ({ page }) => {
    const user = await createTestUser(admin, "inputs-validate");

    try {
      await ensureDefaultRecords(admin, user.id);
      const cookies = await createSupabaseAuthCookies({
        baseURL,
        email: user.email,
        password: user.password,
      });
      await page.context().addCookies(cookies);

      await page.goto("/inputs");
      await expect(page.getByRole("heading", { name: "入力データの登録" })).toBeVisible();

      const familySection = await openSection(page, "家族構成");
      await familySection.getByRole("button", { name: "保存" }).click();

      await expect(familySection.getByText("必須項目です")).toHaveCount(4);
      await expect(page.getByText("保存しました。")).toHaveCount(0);
    } finally {
      await cleanupUserData(admin, user.id);
      await admin.auth.admin.deleteUser(user.id);
    }
  });

  test("ログインユーザーのデータのみ表示される", async ({ page, browser }) => {
    const userA = await createTestUser(admin, "inputs-rls-a");
    const userB = await createTestUser(admin, "inputs-rls-b");
    const incomeLabel = "UserA Income";

    try {
      await ensureDefaultRecords(admin, userA.id);
      await ensureDefaultRecords(admin, userB.id);

      const { error: profileError } = await admin
        .from("profiles")
        .update({
          birth_year: 1975,
          birth_month: 3,
          spouse_birth_year: 1978,
          spouse_birth_month: 6,
        })
        .eq("user_id", userA.id);
      if (profileError) {
        throw profileError;
      }

      const { error: incomeError } = await admin.from("income_streams").insert({
        user_id: userA.id,
        label: incomeLabel,
        take_home_monthly: 320000,
        raise_rate: 0.02,
        start_year_month: "2020-04-01",
        end_year_month: null,
        bonus_amount: 0,
        bonus_months: [],
        bonus_amount_after: null,
        change_year_month: null,
      });
      if (incomeError) {
        throw incomeError;
      }

      const cookiesB = await createSupabaseAuthCookies({
        baseURL,
        email: userB.email,
        password: userB.password,
      });
      await page.context().addCookies(cookiesB);

      await page.goto("/inputs");
      await expect(page.getByRole("heading", { name: "入力データの登録" })).toBeVisible();

      const familySectionB = await openSection(page, "家族構成");
      await expect(familySectionB.getByLabel("本人（年）")).toHaveValue("");
      await expect(page.getByText(incomeLabel)).toHaveCount(0);

      const incomeSectionB = await openSection(page, "収入");
      await expect(incomeSectionB.getByText("収入ストリームの登録はありません。")).toBeVisible();
      await familySectionB.getByLabel("本人（年）").fill("1990");
      await familySectionB.getByLabel("本人（月）").fill("8");
      await familySectionB.getByLabel("配偶者（年）").fill("1992");
      await familySectionB.getByLabel("配偶者（月）").fill("11");
      await familySectionB.getByRole("button", { name: "保存" }).click();
      await expect(page.getByText("保存しました。")).toBeVisible();

      const contextA = await browser.newContext();
      const pageA = await contextA.newPage();
      const cookiesA = await createSupabaseAuthCookies({
        baseURL,
        email: userA.email,
        password: userA.password,
      });
      await contextA.addCookies(cookiesA);

      await pageA.goto("/inputs");
      await expect(pageA.getByRole("heading", { name: "入力データの登録" })).toBeVisible();

      const familySectionA = await openSection(pageA, "家族構成");
      await expect(familySectionA.getByLabel("本人（年）")).toHaveValue("1975");
      await expect(pageA.getByText(incomeLabel)).toBeVisible();

      await contextA.close();
    } finally {
      await cleanupUserData(admin, userA.id);
      await cleanupUserData(admin, userB.id);
      await admin.auth.admin.deleteUser(userA.id);
      await admin.auth.admin.deleteUser(userB.id);
    }
  });
});
