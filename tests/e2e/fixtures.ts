import "dotenv/config";

import { test as base, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

type Fixtures = {
  authenticatedPage: Page;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

const createAdminClient = () => {
  if (!supabaseUrl || !supabaseSecretKey) {
    console.warn("Missing Supabase env vars for E2E cleanup. Data may persist.");
    return null;
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use, testInfo) => {
    const timestamp = Date.now();
    const slug = testInfo.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const email = `e2e+${slug || "test"}-${timestamp}@example.com`;

    const response = await page.request.post("/__e2e/login", { data: { email } });
    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    const userId = typeof result?.userId === "string" ? result.userId : null;

    try {
      await use(page);
    } finally {
      if (userId) {
        const admin = createAdminClient();
        if (admin) {
          try {
            await admin.auth.admin.deleteUser(userId);
          } catch (error) {
            console.warn("Failed to delete E2E user after test.", error);
          }
        }
      }
    }
  },
});

const expectToast = async (page: Page, message: string) => {
  const toast = page
    .locator('[data-sonner-toast][data-visible="true"]')
    .filter({ hasText: message })
    .last();

  await expect(toast).toBeVisible();
};

export { expect, expectToast };
