import { useQuery } from "@rocicorp/zero/react";
import { Link, useRouter } from "@tanstack/react-router";

export function Cart() {
  const { zero, session } = useRouter().options.context;

  const [items] = useQuery(
    zero.query.cartItem
      .where("userId", session.data?.userID ?? "")
      .orderBy("addedAt", "asc"),
    {
      ttl: "1m",
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- taken from ztunes
  return <Link to="/cart">Cart ({items.length ?? 0})</Link>;
}
