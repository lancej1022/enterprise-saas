import { type Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { type Mutators } from "zero/mutators";
import { type Schema } from "zero/schema";
import { Button } from "@solved-contact/ui/components/button";

function query(z: Zero<Schema, Mutators>, userID: string | undefined) {
  return z.query.cartItem
    .related("album", (album) =>
      album.one().related("artist", (artist) => artist.one()),
    )
    .where("userId", userID ?? "");
}

export const Route = createFileRoute("/_authenticated/cart")({
  component: RouteComponent,
  ssr: false,
  loader: ({ context }) => {
    // eslint-disable-next-line no-console -- taken from ztunes
    console.log("preloading cart", context.session);
    const { zero, session } = context;
    const userID = session.data?.userID;
    if (userID) {
      query(zero, userID).preload({ ttl: "5m" }).cleanup();
    }
  },
});

function RouteComponent() {
  const { zero, session } = useRouter().options.context;
  const [cartItems, { type: resultType }] = useQuery(
    query(zero, session.data?.userID),
  );

  if (!session.data) {
    return <div>Login to view cart</div>;
  }

  function onRemove(albumID: string) {
    zero.mutate.cart.remove(albumID);
  }

  return (
    <>
      <h1>Cart</h1>
      {cartItems.length === 0 && resultType === "complete" ? (
        <div>No items in cart 😢</div>
      ) : (
        <table
          border={0}
          cellPadding={0}
          cellSpacing={0}
          style={{ width: 500 }}
        >
          <tbody>
            {cartItems.map((item) =>
              item.album ? (
                <tr key={item.albumId}>
                  <td>
                    {item.album.title} ({item.album.artist?.name})
                  </td>
                  <td style={{ paddingLeft: "1em" }}>
                    <Button onClick={() => onRemove(item.albumId)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ) : null,
            )}
          </tbody>
        </table>
      )}
    </>
  );
}
