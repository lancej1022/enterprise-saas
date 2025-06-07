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

const routes = ["/"];
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

    // Navigate to the route
    await page.goto(`${path}`);

    // Wait for any loading states to resolve
    await page.waitForLoadState("networkidle");

    // Take a screenshot and compare with baseline
    await expect(page).toHaveScreenshot(
      `${route.replace(/\//g, "-") || "home"}.png`,
    );
  });
}
