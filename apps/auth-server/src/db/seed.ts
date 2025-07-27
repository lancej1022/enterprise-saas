import { randomUUID } from "node:crypto";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { accounts, members, organizations, users } from "./schema/auth";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set in the environment variables");
}

export const db = drizzle(dbUrl);

export async function seed() {
  // eslint-disable-next-line no-console -- intentional log for seeding
  console.log("Starting database seeding...");

  // Create 10 organizations
  const organizationData = Array.from({ length: 10 }, (_, _index) => ({
    id: randomUUID(),
    name: faker.company.name(),
    slug: faker.helpers
      .slugify(faker.company.name())
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, ""),
    logo: faker.image.urlLoremFlickr({ category: "business" }),
    createdAt: new Date(),
    metadata: JSON.stringify({
      industry: faker.company.buzzNoun(),
      founded: faker.date.past().getFullYear(),
      employees: faker.number.int({ min: 50, max: 10000 }),
    }),
  }));

  // eslint-disable-next-line no-console -- intentional log for seeding
  console.log("Creating organizations...");
  await db.insert(organizations).values(organizationData);
  // eslint-disable-next-line no-console -- intentional log for seeding
  console.log(`Created ${organizationData.length} organizations`);

  // Create 10,000 users with accounts
  const userData: (typeof users.$inferInsert)[] = [];
  const accountData: (typeof accounts.$inferInsert)[] = [];
  const memberData: (typeof members.$inferInsert)[] = [];

  // eslint-disable-next-line no-console -- intentional log for seeding
  console.log("Creating users and accounts...");

  for (let i = 0; i < 10000; i++) {
    const userId = i === 0 ? "1" : randomUUID();
    const accountId = randomUUID();

    userData.push({
      id: userId,
      name: faker.person.fullName(),
      email:
        i === 0
          ? "test@test.com"
          : faker.internet.email() + Math.random().toString(),
      emailVerified: faker.datatype.boolean(),
      image: faker.image.avatar(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    accountData.push({
      id: accountId,
      accountId: userId, // For email/password, accountId is typically the same as userId
      providerId: "credential", // email/password provider
      userId: userId,
      password: faker.internet.password(), // In real app, this would be hashed
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Assign user to organization (1000 users per org)
    const organizationIndex = Math.floor(i / 1000);
    const organization = organizationData[organizationIndex];
    if (!organization) {
      throw new Error(`Organization at index ${organizationIndex} not found`);
    }
    const organizationId = organization.id;

    memberData.push({
      id: randomUUID(),
      organizationId: organizationId,
      userId: userId,
      role: i % 1000 === 0 ? "admin" : "member", // First user in each org is admin
      createdAt: new Date(),
    });
  }

  // Insert users in batches to avoid memory issues
  const batchSize = 1000;
  for (let i = 0; i < userData.length; i += batchSize) {
    const batch = userData.slice(i, i + batchSize);
    await db.insert(users).values(batch);
    // eslint-disable-next-line no-console -- intentional log for seeding
    console.log(
      `Inserted users ${i + 1} to ${Math.min(i + batchSize, userData.length)}`,
    );
  }

  // Insert accounts in batches
  for (let i = 0; i < accountData.length; i += batchSize) {
    const batch = accountData.slice(i, i + batchSize);
    await db.insert(accounts).values(batch);
    // eslint-disable-next-line no-console -- intentional log for seeding
    console.log(
      `Inserted accounts ${i + 1} to ${Math.min(i + batchSize, accountData.length)}`,
    );
  }

  // Insert members in batches
  for (let i = 0; i < memberData.length; i += batchSize) {
    const batch = memberData.slice(i, i + batchSize);
    await db.insert(members).values(batch);
    // eslint-disable-next-line no-console -- intentional log for seeding
    console.log(
      `Inserted members ${i + 1} to ${Math.min(i + batchSize, memberData.length)}`,
    );
  }

  // eslint-disable-next-line no-console -- intentional log for seeding
  console.log("Database seeding completed successfully!");
  // eslint-disable-next-line no-console -- intentional log for seeding
  console.log(`Created ${userData.length} users`);
  // eslint-disable-next-line no-console -- intentional log for seeding
  console.log(`Created ${accountData.length} accounts`);
  // eslint-disable-next-line no-console -- intentional log for seeding
  console.log(`Created ${organizationData.length} organizations`);
  // eslint-disable-next-line no-console -- intentional log for seeding
  console.log(`Created ${memberData.length} members`);

  // Update the password for the account associated with userId: 1
  // eslint-disable-next-line no-console -- intentional log for seeding
  console.log("Updating password for test user account...");
  await db
    .update(accounts)
    .set({
      password:
        "d00a5564e215b86b8293d7d54137bf1b:3bf4e0c76dbf56cd29991fb51bf666adc9cab05bc303cebc38548a3d4b5f2a620d7ad91f64ef99ea6a7f8828e137afe7bf7ea5d84a8dde19373d092cf49aa281",
      updatedAt: new Date(),
    })
    .where(eq(accounts.userId, "1"));
  // eslint-disable-next-line no-console -- intentional log for seeding
  console.log("Test user password updated successfully!");
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch((error: unknown) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}
