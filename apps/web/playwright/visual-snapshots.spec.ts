import { expect, test } from "@playwright/test";

// TODO: for whatever reason, importing the routeTree and creating a router instance
// causes the test to throw an error. But its definitely something that
// needs to be done in order to make this work as more routes are added.
// import { routeTree } from '../src/routeTree.gen';
// import { createRouter } from '@tanstack/react-router';

// Create a test router instance to extract routes
// const router = createRouter({ routeTree });

// Get all routes from the router
// const routes = router.flatRoutes.map((route) => route.path);

const routes = ["/", "/login", "/signup"];

// Mock user data that matches the User type from auth.tsx
const mockUser = {
  created_at: "2024-01-01T00:00:00Z",
  email: "test@example.com",
  id: "123e4567-e89b-12d3-a456-426614174000",
  is_chirpy_red: false,
  updated_at: "2024-01-01T00:00:00Z",
};

// Test each route
for (const route of routes) {
  test(`Visual snapshot of route: ${route}`, async ({ page }) => {
    // Skip routes with path parameters for simplicity
    // You could replace parameters with actual values if needed
    if (route.includes(":")) {
      test.skip();
      return;
    }

    // Normalize empty route to root path
    const path = route === "" ? "/" : route;

    // For the index route, mock authentication by setting localStorage
    if (route === "/") {
      // Navigate to the page first
      await page.goto(path);

      // Inject the mock user into localStorage before the auth check
      await page.evaluate((user) => {
        localStorage.setItem("auth.user", JSON.stringify(user));
      }, mockUser);

      // Reload to trigger the auth context with the mocked user
      await page.reload();
    } else {
      // For other routes (login, signup), navigate normally
      await page.goto(path);
    }

    // Wait for any loading states to resolve
    await page.waitForLoadState("networkidle");

    // Take a screenshot and compare with baseline
    await expect(page).toHaveScreenshot(
      `${route.replace(/\//g, "-") || "home"}.png`,
    );
  });
}
