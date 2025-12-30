import { test as base, expect, type Page } from "@playwright/test";

type Fixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use, testInfo) => {
    const timestamp = Date.now();
    const slug = testInfo.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const email = `e2e+${slug || "test"}-${timestamp}@example.com`;

    await page.request.post("/__e2e/login", { data: { email } });

    await use(page);
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
