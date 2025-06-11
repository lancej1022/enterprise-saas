import { expect, test } from "@playwright/test";

test.describe("Signup Flow", () => {
  test("should successfully sign up a new user and redirect to home", async ({
    page,
  }) => {
    await page.goto("/signup");

    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: "Sign up for an account" }),
    ).toBeVisible();

    // Generate a unique email for this test run to avoid conflicts
    const timestamp = Date.now();
    const testEmail = `test-user-${timestamp}@example.com`;
    const testPassword = "SecurePassword123!";

    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill(testPassword);

    await page.getByRole("button", { name: "Login", exact: true }).click();

    await page.waitForLoadState("networkidle");

    // Verify that we've been redirected to the home page
    await expect(page).toHaveURL("/");

    // TODO: Verify that we're actually logged in by checking for user-specific content
    await expect(page).not.toHaveURL("/signup");
    await expect(page).not.toHaveURL("/login");
  });

  test("should show validation errors for invalid input", async ({ page }) => {
    await page.goto("/signup");

    await page.waitForLoadState("networkidle");

    await page.getByLabel("Email").fill("invalid-email");
    await page.getByLabel("Password").fill("short");

    await page.getByRole("button", { name: "Login", exact: true }).click();

    // Wait a bit for validation to kick in
    await page.waitForTimeout(250);

    // Should still be on the signup page due to validation errors
    await expect(page).toHaveURL("/signup");

    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
  });

  test("should allow navigation between signup and login pages", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: "Sign up for an account" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Login" }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("/login");
    await expect(
      page.getByRole("heading", { name: "Login to your account" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Sign up" }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL("/signup");
    await expect(
      page.getByRole("heading", { name: "Sign up for an account" }),
    ).toBeVisible();
  });
});
