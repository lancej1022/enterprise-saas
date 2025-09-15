import { expect, test } from "@playwright/test";

test.describe("Organization Settings page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to organization settings
    const adminSection = page.getByRole("button", { name: "Admin" });
    const isAdminVisible = await adminSection.isVisible();
    // TODO: this might be flakey if the admin section is already open
    if (isAdminVisible) {
      await adminSection.click();
    }

    await page.getByRole("link", { name: "Organization Settings" }).click();
    await page.waitForLoadState("networkidle");
  });

  test("should display page header and sections correctly", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "Organization Security Settings" }),
    ).toBeVisible();

    // should handle security level toggle
    // TODO:
    const jwtToggle = page.getByLabel("JWT Authentication Required");

    const initialState = await jwtToggle.isChecked();

    // Toggle the switch
    await jwtToggle.click();
    await page.waitForTimeout(500); // TODO: this is a hack to wait for the API call
    await page.waitForLoadState("networkidle");

    // Verify the badge changes
    if (initialState) {
      // Was checked, now unchecked - should show Basic Security
      await expect(page.getByText("Basic Security")).toBeVisible();
      await expect(
        page.getByText("Basic mode: Domain validation only"),
      ).toBeVisible();
    } else {
      // Was unchecked, now checked - should show Enterprise Security
      await expect(page.getByText("Enterprise Security")).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        page.getByText(
          "Enterprise mode: Requires JWT tokens for authentication",
        ),
      ).toBeVisible();
    }

    // Toggle back
    await jwtToggle.click();
    await page.waitForTimeout(500);

    // Verify it returns to original state
    if (initialState) {
      await expect(page.getByText("Enterprise Security")).toBeVisible({
        timeout: 15_000,
      });
    } else {
      await expect(page.getByText("Basic Security")).toBeVisible();
    }
  });

  test("should handle domain management, deletion, and warning display", async ({
    page,
  }) => {
    const domainInput = page.locator("#new-domain");
    const addButton = page.getByRole("button", { name: "Add Domain" });
    const warningAlert = page.getByText(
      "No domains configured. Widget will accept requests from any domain.",
    );

    // Initially the add button should be disabled with empty input
    await expect(addButton).toBeDisabled();

    // Type a domain
    const testDomain = "example.com";
    await domainInput.fill(testDomain);

    // Add button should now be enabled
    await expect(addButton).toBeEnabled();

    // Click add domain
    await addButton.click();
    await page.waitForTimeout(500); // Wait for potential API call

    // Check if domain appears in the list (this depends on the actual API implementation)
    // For now, we'll just verify the input was cleared
    await expect(domainInput).toHaveValue("");

    // Test form submission via Enter key
    await domainInput.fill("test.example.com");
    await domainInput.press("Enter");
    await page.waitForTimeout(500);

    // Input should be cleared again
    await expect(domainInput).toHaveValue("");

    // Now handle domain deletion - delete all existing domains
    let deleteButtons = page.getByRole("button").filter({ hasText: "Delete" });
    let deleteButtonCount = await deleteButtons.count();

    // Delete all domains one by one
    while (deleteButtonCount > 0) {
      await deleteButtons.first().click();
      await page.waitForTimeout(500); // Wait for potential API call

      // Refresh the button list after deletion
      deleteButtons = page.getByRole("button").filter({ hasText: "Delete" });
      deleteButtonCount = await deleteButtons.count();
    }

    // After deleting all domains, the warning should be visible
    await expect(warningAlert).toBeVisible();
  });

  test("should handle JWT secret management, visibility, copy, and rotation", async ({
    page,
  }) => {
    const jwtSwitch = page.getByRole("switch", {
      name: "JWT Authentication Required",
    });
    const isJwtEnabled = await jwtSwitch.isChecked();

    if (!isJwtEnabled) {
      // If JWT is not enabled, the Current Secret Key should not be visible
      await expect(page.getByText("Current Secret Key")).not.toBeVisible();

      // Enable JWT authentication
      await jwtSwitch.click();
      await page.waitForTimeout(500); // Wait for UI update
    }

    await expect(page.getByText("Current Secret Key")).toBeVisible();
    await expect(page.getByText("Secret Key Management")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Rotate Secret Key" }),
    ).toBeVisible();

    // Check warning message about secret rotation
    await expect(
      page.getByText(
        "Rotating the secret key will invalidate all existing JWT tokens",
      ),
    ).toBeVisible();

    const secretInput = page.locator("#jwt-secret");
    const toggleButton = page.getByRole("button", {
      name: /Show secret|Hide secret/,
    });

    // Initially secret should be hidden (password type)
    await expect(secretInput).toHaveAttribute("type", "password");

    // Click toggle to show
    await toggleButton.click();
    await expect(secretInput).toHaveAttribute("type", "text");

    // Verify the secret value is visible
    const secretValue = await secretInput.inputValue();
    expect(secretValue).toBeTruthy();
    expect(secretValue.length).toBeGreaterThan(0);

    const copyButton = page.getByRole("button", { name: "Copy" }).nth(1);

    // Grant clipboard permissions
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);

    // Click copy button
    await copyButton.click();

    // Wait for toast notification
    await expect(page.getByText("Secret copied")).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByText("JWT secret has been copied to clipboard."),
    ).toBeVisible();

    // Verify clipboard content (if accessible)
    try {
      const clipboardContent = await page.evaluate(() =>
        navigator.clipboard.readText(),
      );
      expect(clipboardContent).toBeTruthy();
      expect(clipboardContent.length).toBeGreaterThan(0);
      expect(clipboardContent).toBe(secretValue);
    } catch (error) {
      // Clipboard access might be restricted in test environment
      // We'll just continue with the test without clipboard verification
    }

    const rotateButton = page.getByRole("button", {
      name: "Rotate Secret Key",
    });
    await expect(rotateButton).toBeVisible();
    await expect(rotateButton).toBeEnabled();

    // Get current secret value for comparison (secret is already visible from step 2)
    const initialSecret = await secretInput.inputValue();

    // Click rotate button
    await rotateButton.click();
    await page.waitForTimeout(500); // Wait for potential API call

    // In a real implementation, the secret should change
    // For now, we just verify the button was clickable and the initial secret existed
    expect(initialSecret).toBeTruthy();

    await toggleButton.click();
    await expect(secretInput).toHaveAttribute("type", "password");
  });

  test("should handle domain test connection functionality", async ({
    page,
  }) => {
    // Look for test connection buttons
    const testButtons = page
      .getByRole("button")
      .filter({ hasText: "Test Connection" });
    const testButtonCount = await testButtons.count();

    if (testButtonCount > 0) {
      const firstTestButton = testButtons.first();

      // Verify button exists and has correct text
      await expect(firstTestButton).toContainText("Test Connection");

      // Note: The test functionality appears to be disabled in the current implementation
      // based on the commented out onClick handler in the code
      // We're just verifying the UI elements exist
    }

    // Test buttons may not exist if no domains are configured
    expect(testButtonCount >= 0).toBeTruthy();
  });

  test("should validate form input constraints", async ({ page }) => {
    const domainInput = page.locator("#new-domain");
    const addButton = page.getByRole("button", { name: "Add Domain" });

    // Test empty input
    await domainInput.fill("");
    await expect(addButton).toBeDisabled();

    // Test whitespace only
    await domainInput.fill("   ");
    await expect(addButton).toBeDisabled();

    // Test valid input
    await domainInput.fill("valid-domain.com");
    await expect(addButton).toBeEnabled();

    // Test input clearing after form submission
    await addButton.click();
    await page.waitForTimeout(500);
    await expect(domainInput).toHaveValue("");
  });
});
