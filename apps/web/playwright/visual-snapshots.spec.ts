import { type User } from "@/auth";
import { expect, test } from "@playwright/test";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { routeTree } from "../src/routeTree.gen";

const queryClient = new QueryClient();

// Create a test router instance to extract routes
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined,
  },
});

// Get all route paths from the generated routeTree
const routes = router.flatRoutes.reduce<string[]>((acc, route) => {
  // This should technically always be truthy, but Ive added this to be safe
  if (route.path) {
    acc.push(String(route.path));
  }
  return acc;
}, []);

const mockUser = {
  created_at: "2024-01-01T00:00:00Z",
  email: "test@example.com",
  id: "123e4567-e89b-12d3-a456-426614174000",
  is_chirpy_red: false,
  updated_at: "2024-01-01T00:00:00Z",
} satisfies User;

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

    // For the login and signup routes there is no need to be authenticated to grab the screenshot
    if (path === "login" || path === "signup") {
      await page.goto(path);
    } else {
      // TODO: this setup can be improved by reviewing the Playwright auth docs and just reusing the auth state instead of constantly setting the user in localStorage on each test
      await page.goto(path);
      // Inject the mock user into localStorage before the auth check
      await page.evaluate((user) => {
        localStorage.setItem("auth.user", JSON.stringify(user));
      }, mockUser);

      // Reload to trigger the auth context with the mocked user
      await page.reload();
    }

    // Wait for any loading states to resolve
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot(
      `${route.replace(/\//g, "-") || "home"}.png`,
    );
  });
}
