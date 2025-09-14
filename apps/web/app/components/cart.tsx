import { useQuery } from "@rocicorp/zero/react";
import { Link, useRouter } from "@tanstack/react-router";
import { getCartItemsSimpleQuery } from "@solved-contact/backend/zero/get-queries";

export function Cart() {
  const { session } = useRouter().options.context;
  const [items] = useQuery(getCartItemsSimpleQuery(session.data?.userID ?? ""));

  // TODO: review if this actually needs nullish coalescing
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- taken from ztunes
  return <Link to="/cart">Cart ({items.length ?? 0})</Link>;
}
