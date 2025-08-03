import AxeBuilder from "@axe-core/playwright"; // 1
import { expect, test } from "@playwright/test";
import { type Zero } from "@rocicorp/zero";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { type Mutators } from "zero/mutators";
import { type Schema } from "zero/schema";

import { type SessionContextType } from "#/components/session-init";
import { routeTree } from "#/routeTree.gen";
import { orpc } from "#/utils/orpc";

const queryClient = new QueryClient();

// Create a test router instance to extract routes
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    orpc,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- taken from ztunes
    session: undefined as unknown as SessionContextType,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- taken from ztunes
    zero: undefined as unknown as Zero<Schema, Mutators>,
  },
});

const routes = Object.keys(router.routesByPath);

test.describe("Visual snapshots of unauthenticated routes", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  const unAuthenticatedPaths = ["/login", "/signup"];

  for (const path of unAuthenticatedPaths) {
    test(`Visual snapshot and accessibility check of route: ${path}`, async ({
      page,
    }) => {
      await page.goto(path);

      await page.waitForLoadState("networkidle");
      await expect(page.getByText(/loading/i).first()).not.toBeVisible({
        timeout: 20_000,
      });

      // Need to remove slashes from the route path otherwise the generated filename is invalid
      const screenshotName = path.slice(1).replace(/\//g, "-");
      await expect(page).toHaveScreenshot(screenshotName + ".png");

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});

for (const route of routes) {
  if (route.includes("login") || route.includes("signup")) {
    continue;
  }

  test(`Visual snapshot and accessibility check of route: ${route}`, async ({
    page,
  }) => {
    // Skip routes with path parameters for simplicity
    // You could replace parameters with actual values if needed
    if (route.includes(":") || route.includes("$")) {
      // eslint-disable-next-line no-console -- for debugging
      console.log("Skipping route with path parameters:", route);
      test.skip();
      return;
    }

    // Normalize empty route to root path
    const path = route === "" ? "/" : route;

    if (path === "/artist") {
      // eminem artist id
      // path = "artist?id=b95ce3ff-3d05-4e87-9e01-c97b66af13d4";
      test.skip();
      return;
    }
    await page.goto(path);

    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/loading/i).first()).not.toBeVisible({
      timeout: 20_000,
    });

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
