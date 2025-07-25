import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const authFile = path.join(__dirname, "./.auth/user.json");

test.describe("Unauthenticated state on login and signup pages", () => {
  // these tests are not parallelizable because the signup test MUST run last, since it changes the auth state
  // test.describe.configure({ mode: "default" });
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should show validation errors for invalid input", async ({ page }) => {
    await page.goto("/signup");

    await page.waitForLoadState("networkidle");

    await page.getByLabel("Email").fill("invalid-email");
    await page.getByLabel("Password").fill("short");

    await page.getByRole("button", { name: "Sign up", exact: true }).click();

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

  test("should be able to sign up a new user, redirect to home, log out, and log in again with that same user", async ({
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
    const testPassword = "InsecurePassword123!";

    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill(testPassword);

    await page.getByRole("button", { name: "Sign up", exact: true }).click();

    await page.waitForLoadState("networkidle");

    // Verify that we've been redirected to the home page
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("button", { name: new RegExp(testEmail, "i") }),
    ).toBeVisible();

    // --- Log out via the left nav user menu ---
    // Open the user menu (sidebar footer, hardcoded to shadcn/m@example.com for now)
    await page
      .getByRole("button", { name: new RegExp(testEmail, "i") })
      .click();
    await page.getByRole("menuitem", { name: /log out/i }).click();
    // Wait for redirect to login page
    await page.waitForURL("/login");
    await expect(page).toHaveURL("/login");

    // --- Log in again with the same credentials ---
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill(testPassword);
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await page.waitForLoadState("networkidle");
    // Should be redirected to home/dashboard
    await expect(page).toHaveURL("/");
    await page.context().storageState({ path: authFile });
  });
});
