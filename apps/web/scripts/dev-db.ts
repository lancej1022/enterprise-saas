import { must } from "shared/must";

import "shared/env";

import { exec } from "shared/exec";

const devPgPassword = must(
  process.env.DEV_PG_PASSWORD,
  "DEV_PG_PASSWORD is required",
);

function main() {
  try {
    // eslint-disable-next-line no-console -- taken from ztunes
    console.log("Attempting to start existing ztunes container...");
    exec("docker start -a ztunes");
    // eslint-disable-next-line no-console -- taken from ztunes
    console.log("ztunes container started.");
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, no-console -- this cast was taken from ztunes
    console.log((error as Error).message);
    // eslint-disable-next-line no-console -- taken from ztunes
    console.log(
      "Existing ztunes container not found or could not be started. Creating a new one...",
    );
    try {
      exec(
        // TODO: originally this was using `5432:5432` but it conflicted with hono. I need to review whether this is the right way to allow Zero to connect to the same PG database!
        `docker run --rm --name ztunes -e POSTGRES_PASSWORD=${devPgPassword} -p 5433:5433 postgres -c wal_level=logical`,
      );
    } catch (runError) {
      console.error("Failed to create and run new container:", runError);
    }
  }
}

main();
