import * as fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { db } from "db/index";
import { sql } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  const sqlFilePath = join(__dirname, "../db/seed.sql.data");
  const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");

  try {
    if (
      // eslint-disable-next-line @typescript-eslint/await-thenable -- taken from ztunes
      (await (
        await db.execute(sql.raw("select 1 from artist limit 1"))
      ).rowCount) === 1
    ) {
      // eslint-disable-next-line no-console -- taken from ztunes
      console.log("Database already seeded.");
    } else {
      // eslint-disable-next-line no-console -- taken from ztunes
      console.log("Seeding database...");
      await db.execute(sql.raw(sqlContent));
      // eslint-disable-next-line no-console -- taken from ztunes
      console.log("✅ Seeding complete.");
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

await seed();
