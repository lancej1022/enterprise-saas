import { useEffect, useState } from "react";
import { type Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/react";
import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useDebouncedCallback } from "use-debounce";
import { type Mutators } from "@solved-contact/auth-server/zero/mutators";
import { type Schema } from "@solved-contact/auth-server/zero/schema";
import { Input } from "@solved-contact/ui/components/input";
import { Label } from "@solved-contact/ui/components/label";

import { Link } from "#/components/link";

const limit = 20;

function query(z: Zero<Schema, Mutators>, q: string | undefined) {
  let query = z.query.artist.orderBy("popularity", "desc").limit(limit);
  if (q) {
    query = query.where("name", "ILIKE", `%${q}%`);
  }
  return query;
}

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
  validateSearch: (search: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- taken from ztunes
    return {
      q: typeof search.q === "string" ? search.q : undefined,
    } as { q?: string | undefined };
  },
  ssr: false,
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ context, deps: { q } }) => {
    const { zero } = context;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- TODO: at one point zero was undefined here on the first render, but lifting up the ZeroProvider to the __root route MIGHT havefixed it
    if (!zero) {
      console.error("zero is undefined");
      return;
    }
    query(zero, q).preload({ ttl: "5m" }).cleanup();
  },
});

function Home() {
  const router = useRouter();
  const { zero, orpc } = router.options.context;

  const privateData = useTanstackQuery(orpc.privateData.queryOptions());
  const healthCheck = useTanstackQuery(orpc.healthCheck.queryOptions());

  const [search, setSearch] = useState("");
  const qs = Route.useSearch();
  const searchParam = qs.q ?? "";
  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

  // No need to cache the queries for each individual keystroke. Just
  // cache them when the user has paused, which we know by when the
  // QS matches because we already debounce the QS.
  const ttl = search === searchParam ? "5m" : "none";
  const [artists, { type }] = useQuery(query(zero, search), {
    ttl,
  });

  // Safari has a limit on how fast you can change QS. Anyway it makes no sense
  // to have a history entry for each keystroke anyway so even without this we'd
  // have to have some URL entries be replace and some not. Easier to just skip
  // history entries until user pauses.
  const setSearchParam = useDebouncedCallback((text: string) => {
    void router.navigate({
      to: "/",
      search: {
        q: text.length > 0 ? text : undefined,
      },
    });
  }, 500);

  function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setSearchParam(e.target.value);
  }

  // If the typing has settled, use the default preload behavior.
  // Otherwise, don't preload.
  const preload = search === searchParam ? undefined : false;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1>Home</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl">
          <p>oRPC private data: {privateData.data?.message}</p>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl">
          <div
            className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-muted-foreground text-sm">
            {healthCheck.isLoading
              ? "Checking..."
              : healthCheck.data
                ? "oRPC health check: Connected"
                : "oRPC health check: Disconnected"}
          </span>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 flex-1 rounded-xl md:min-h-min">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2 style={{ margin: "1em 0 0.2em 0" }}>
            Search 85,000 artists from the 1990s...
          </h2>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            onChange={onSearchChange}
            style={{ fontSize: "125%" }}
            type="text"
            value={search}
          />
        </div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {artists.map((artist) => (
            <li key={artist.id} style={{ marginBottom: "0.2em" }}>
              <Link preload={preload} search={{ id: artist.id }} to="/artist">
                {artist.name}
              </Link>
            </li>
          ))}
          {type === "unknown" && artists.length < limit && (
            <div>Loading...</div>
          )}
        </ul>
      </div>
    </div>
  );
}
