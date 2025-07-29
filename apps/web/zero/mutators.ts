import { type CustomMutatorDefs } from "@rocicorp/zero";

import { type DecodedJWT, type schema } from "./schema";

export function createMutators(authData: DecodedJWT | undefined) {
  return {
    cart: {
      add: async (
        tx,
        { albumID, addedAt }: { addedAt: number; albumID: string },
      ) => {
        if (!authData) {
          throw new Error("Not authenticated");
        }
        try {
          await tx.mutate.cartItem.insert({
            userId: authData.sub,
            albumId: albumID,
            addedAt: tx.location === "client" ? addedAt : Date.now(),
          });
        } catch (err) {
          console.error("error adding cart item", err);
          throw err;
        }
      },

      remove: async (tx, albumId: string) => {
        if (!authData) {
          throw new Error("Not authenticated");
        }
        const cartItem = await tx.query.cartItem
          .where("userId", authData.sub)
          .where("albumId", albumId)
          .one();
        if (!cartItem) {
          return;
        }
        await tx.mutate.cartItem.delete({
          userId: cartItem.userId,
          albumId: cartItem.albumId,
        });
      },
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
