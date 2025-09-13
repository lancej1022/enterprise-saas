import { drizzle } from "drizzle-orm/node-postgres";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set in the environment variables");
}

export const db = drizzle(dbUrl);

// This is where db seeding could occur
// async function main() {
// const user: typeof users.$inferInsert = {
//   name: "John",
//   emailVerified: false,
//   //   TODO: is a JS date truly what we want...?
//   createdAt: new Date(),
//   updatedAt: new Date(),
//   email: "john@example.com",
// };
// await db.insert(users).values(user);
// // eslint-disable-next-line no-console -- intentional log
// console.log("New user created!");
// const users = await db.select().from(users);
// // eslint-disable-next-line no-console -- intentional log
// console.log("Getting all users from the database: ", users);
// /*
//   const users: {
//     id: number;
//     name: string;
//     age: number;
//     email: string;
//   }[]
//   */
// await db
//   .update(users)
//   .set({
//     name: "Jane",
//   })
//   .where(eq(users.email, user.email));
// // eslint-disable-next-line no-console -- intentional log
// console.log("User info updated!");
// await db.delete(users).where(eq(users.email, user.email));
// // eslint-disable-next-line no-console -- intentional log
// console.log("User deleted!");
// }
