import { type Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { type Mutators } from "zero/mutators";
import { type Schema } from "zero/schema";
import { Button } from "@solved-contact/ui/components/button";

function query(zero: Zero<Schema, Mutators>, artistID: string | undefined) {
  return zero.query.artist
    .where("id", artistID ?? "")
    .related("albums", (album) => album.related("cartItems"))
    .one();
}

export const Route = createFileRoute("/_authenticated/artist")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- taken from ztunes
    return {
      id: typeof search.id === "string" ? search.id : undefined,
    } as { id: string | undefined };
  },
  ssr: false,
  loaderDeps: ({ search }) => ({ artistId: search.id }),
  loader: ({ context, deps: { artistId } }) => {
    const { zero } = context;
    // eslint-disable-next-line no-console -- taken from ztunes
    console.log("preloading artist", artistId);
    query(zero, artistId).preload({ ttl: "5m" }).cleanup();
  },
});

function RouteComponent() {
  const { zero, session } = useRouter().options.context;
  const { id } = Route.useSearch();

  if (!id) {
    return <div>Missing required search parameter id</div>;
  }

  // eslint-disable-next-line react-hooks/react-compiler -- taken from ztunes
  // eslint-disable-next-line react-hooks/rules-of-hooks -- taken from ztunes
  const [artist, { type }] = useQuery(query(zero, id), { ttl: "5m" });

  if (!artist && type === "complete") {
    return <div>Artist not found</div>;
  }

  if (!artist) {
    return null;
  }

  // @ts-expect-error -- taken from ztunes
  function cartButton(album: (typeof artist.albums)[number]) {
    if (!session.data) {
      return <Button disabled>Login to shop</Button>;
    }

    const message =
      album.cartItems.length > 0 ? "Remove from cart" : "Add to cart";
    const action =
      album.cartItems.length > 0
        ? () => zero.mutate.cart.remove(album.id)
        : () =>
            zero.mutate.cart.add({ albumID: album.id, addedAt: Date.now() });
    return <Button onClick={action}>{message}</Button>;
  }

  return (
    <>
      <h1>{artist.name}</h1>
      <ul>
        {artist.albums.map((album) => (
          <li key={album.id}>
            {album.title} ({album.year}) {cartButton(album)}
          </li>
        ))}
      </ul>
    </>
  );
}
