import AxeBuilder from "@axe-core/playwright"; // 1
import { expect, test } from "@playwright/test";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { type User } from "#/auth";

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

const routes = Object.keys(router.routesByPath);

const mockUser = {
  createdAt: new Date("2024-01-01T00:00:00Z"),
  email: "test@example.com",
  name: "Test User",
  id: "123e4567-e89b-12d3-a456-426614174000",
  emailVerified: false,
  updatedAt: new Date("2024-01-01T00:00:00Z"),
} satisfies User;

for (const route of routes) {
  test(`Visual snapshot and accessibility check of route: ${route}`, async ({
    page,
  }) => {
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
      // TODO: this setup can be improved by reviewing the Playwright auth docs and just reusing the auth state instead of constantly setting the user in sessionStorage on each test
      await page.goto(path);
      // Inject the mock user into sessionStorage before the auth check
      await page.evaluate((user) => {
        sessionStorage.setItem("auth.user", JSON.stringify(user));
      }, mockUser);

      // Reload to trigger the auth context with the mocked user
      await page.reload();
    }

    await page.waitForLoadState("networkidle");

    // Need to remove slashes from the route path otherwise the generated filename is invalid
    const screenshotName =
      route === "/"
        ? "home"
        : // slice(1) removes leading slash before replacing any remaining ones, so that we dont wind up with `-segmentHere-nextSegment`
          route.slice(1).replace(/\//g, "-");
    await expect(page).toHaveScreenshot(screenshotName + ".png");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
}
