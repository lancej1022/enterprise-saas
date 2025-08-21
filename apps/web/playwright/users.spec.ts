import { expect, test } from "@playwright/test";

test.describe("Users page search functionality", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should handle user search and navigation flow", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@test.com");
    await page.getByLabel("Password").fill("aaaaaaaa");
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await page.waitForLoadState("networkidle");

    // The Admin section should be expanded by default (isActive: true),
    // but click it if the Users link is not immediately visible
    const usersLink = page.getByRole("link", { name: "Users" });

    // Check if Users link is visible, if not, expand Admin section first
    const isUsersVisible = await usersLink.isVisible();
    if (!isUsersVisible) {
      const adminSection = page.getByRole("button", { name: "Admin" });
      await adminSection.click();
    }

    // Click on Users option from the Admin section
    await usersLink.click();
    await page.waitForLoadState("networkidle");

    // 1. Verify Mark Jacobs is initially visible on the page 1 results
    await expect(page.getByText("Mark Jacobs")).toBeVisible({
      timeout: 75_000,
    });

    const searchInput = page.getByLabel("User search");
    await searchInput.click();
    await searchInput.fill("Teresa Rippin");

    // Wait for search to process (debounced)
    await page.waitForTimeout(500);
    await page.waitForLoadState("networkidle");

    // 3. Verify Mark Jacobs is no longer visible and Teresa Rippin is visible
    await expect(page.getByText("Mark Jacobs")).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: /Teresa Rippin/i }),
    ).toBeVisible();

    // 4. Clear the search using the clear button
    const clearButton = page.getByRole("button", { name: "Clear search" });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Wait for search to clear
    await page.waitForTimeout(500);
    await page.waitForLoadState("networkidle");

    // 5. Verify results reset - Mark Jacobs should be visible again
    await expect(page.getByText("Mark Jacobs")).toBeVisible();

    // 6. Search for "Mark" specifically
    await searchInput.fill("Mark");

    // Wait for search to process
    await page.waitForTimeout(500);
    await page.waitForLoadState("networkidle");

    // 7. Verify Mark is visible and Teresa is not
    await expect(page.getByText("Mark Jacobs")).toBeVisible();
    await expect(page.getByText(/Teresa/i)).not.toBeVisible();

    // 8. Click on Mark Jacobs to navigate to User Details page
    const MarkKohlerLink = page.getByRole("link", { name: "Mark Jacobs" });
    await MarkKohlerLink.click();
    await page.waitForLoadState("networkidle");

    // 9. Verify we're on the User Details page and Mark's name is displayed
    await expect(
      page.getByRole("heading", { name: "User Details" }),
    ).toBeVisible();
    await expect(page.getByText("Mark Jacobs")).toBeVisible();
  });

  test("should handle empty search results gracefully", async ({ page }) => {
    // Navigate to the index page first
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@test.com");
    await page.getByLabel("Password").fill("aaaaaaaa");
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await page.waitForLoadState("networkidle");

    // The Admin section should be expanded by default (isActive: true),
    // but click it if the Users link is not immediately visible
    const usersLink = page.getByRole("link", { name: "Users" });

    // Check if Users link is visible, if not, expand Admin section first
    const isUsersVisible = await usersLink.isVisible();
    if (!isUsersVisible) {
      const adminSection = page.getByRole("button", { name: "Admin" });
      await adminSection.click();
    }

    // Click on Users option from the Admin section
    await usersLink.click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("No users found.")).toBeVisible();
    await expect(page.getByText("No users found.")).not.toBeVisible({
      timeout: 75_000,
    });

    // Search for something that doesn't exist
    const searchInput = page.getByLabel("User search");
    await searchInput.fill("nonexistentuser123nzvxcnbvmnczxv");

    // Wait for search to process
    await page.waitForTimeout(500);
    await page.waitForLoadState("networkidle");

    // Should show "No users found" message
    await expect(page.getByText("No users found.")).toBeVisible();

    // Clear the search
    const clearButton = page.getByRole("button", { name: "Clear search" });
    await clearButton.click();

    // Wait for search to clear
    await page.waitForTimeout(500);
    await page.waitForLoadState("networkidle");

    // Users should be visible again
    await expect(page.getByText("No users found.")).not.toBeVisible();
  });
});
