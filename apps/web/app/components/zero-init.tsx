import { useMemo } from "react";
import { type Zero } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";
import { useRouter } from "@tanstack/react-router";
import { must } from "shared/must";
import { createMutators, type Mutators } from "zero/mutators";
import { schema, type Schema } from "zero/schema";

if (typeof import.meta.env === "undefined") {
  // @ts-expect-error -- this is a hack to make sure `import.meta.env` doesnt crash playwright
  import.meta.env = {};
}

const serverURL = must<string>(
  // TODO: the only reason we need the `process.env` fallback is because playwright somehow trips over `import.meta.env`
  import.meta.env.VITE_PUBLIC_SERVER || process.env.VITE_PUBLIC_SERVER,
  "VITE_PUBLIC_SERVER is required",
);

export function ZeroInit({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session } = router.options.context;

  const opts = useMemo(() => {
    return {
      schema,
      userID: session.data?.userID ?? "anon",
      auth: session.zeroAuth,
      server: serverURL,
      mutators: createMutators(
        session.data?.userID
          ? {
              sub: session.data.userID,
              activeOrganizationId: session.data.activeOrganizationId,
            }
          : undefined,
      ),
      init: async (zero: Zero<Schema, Mutators>) => {
        router.update({
          context: {
            ...router.options.context,
            zero,
          },
        });

        await router.invalidate();

        preload(zero);
      },
    };
    // eslint-disable-next-line react-hooks/react-compiler -- taken from ztunes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- taken from ztunes
  }, [session.data?.userID, router]);

  return <ZeroProvider {...opts}>{children}</ZeroProvider>;
}

function preload(z: Zero<Schema>) {
  // Delay preload() slightly to avoid blocking UI on first run. We don't need
  // this data to display the UI, it's used by search.
  setTimeout(() => {
    // Why this particular preload?
    //
    // The goal of Zero generally is for every user interaction to be instant.
    // This relies fundamentally on preloading data. But we cannot preload
    // everything, so preloading is at core about guessing data user will most
    // likely need. This is different in every app. Zero gives you the full
    // power of queries to express and orchestrate whatever preload sequence you
    // want.
    //
    // For this app, the primary interface is a search box. Users are more
    // likely to search for popular artists than unpopular so we preload the
    // first 1k artists by popularity.
    //
    // Note that we don't also preload their albums. We could, but there's no
    // reason to as the list UI will do that. We know the user can't navigate to
    // an album they don't see in the UI, so there's no point in preloading
    // more.
    //
    // There is also an interesting interaction with the UI. Since we will get
    // instant local results and full server results async, we ideally want to
    // avoid having the UI jostle. So we want to preload in the same order we
    // tend to display in the UI. That way local results are always also the
    // top ranked results.
    z.query.artist.orderBy("popularity", "desc").limit(1000).preload({
      ttl: "1m",
    });
  }, 1000);
}
