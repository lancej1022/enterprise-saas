# README

## Docker

<!-- OLD: `docker run --name drizzle-postgres -e POSTGRES_PASSWORD=mypassword -d -p 5432:5432 postgres:17` -->

`docker compose up -d`

1. The `--name` option assigns the container the name `drizzle-postgres`.
2. The `-e POSTGRES_PASSWORD=` option sets the `POSTGRES_PASSWORD` environment variable with the specified value.
3. The `-d` flag runs the container in detached mode (in the background).
4. The `-p` option maps port 5432 on the container to port 5432 on your host machine, allowing PostgreSQL to be accessed from your host system through this port.
5. The postgres argument specifies the image to use for the container. You can also specify other versions like postgres:15.

The -e POSTGRES_USER= option sets the POSTGRES_USER environment variable with the specified value. Postgres uses the default user when this is empty. Most of the time, it is postgres and you can check it in the container logs in Docker Desktop or by running docker logs <container_name>.
The -e POSTGRES_DB= option sets the POSTGRES_DB environment variable with the specified value. Defaults to the POSTGRES_USER value when is empty.

## Better auth

Generate a drizzle schema based on the Better auth config -- `npx @better-auth/cli@latest generate`

## Drizzle

1. `pnpm exec drizzle-kit generate` -> Generate migrations (this should be run AFTER the better auth CLI generate from the above step^^)
2. DOESNT SEEM TO WORK: `npx drizzle-kit migrate` -> apply migrations
3. `pnpm exec drizzle-kit push` -> applies migrations, but less safely

### Seeding

Seeding the database is done using the `db:seed` script for auth logic, and the zero stuff within `/web` has its own logic
that will eventually be moved into this directory

The full flow in a FRESH db is basically:

1. `docker compose up -d`
2. `pnpm drizzle-kit push`
3. `[DB URL ENV GOES HERE] pnpm db:seed`
4. `pnpm --filter=web dev` -- seeds the artist data and all that

THEN need to manually enter the db via drizzle studio and update the password where `accountId = 1` -> "d00a5564e215b86b8293d7d54137bf1b:3bf4e0c76dbf56cd29991fb51bf666adc9cab05bc303cebc38548a3d4b5f2a620d7ad91f64ef99ea6a7f8828e137afe7bf7ea5d84a8dde19373d092cf49aa281"

### Debugging

If you see an error such as "failed to decrypt private key" or something from better auth, try console.log(secret) within `src/lib/auth.ts` to make sure its g2g.
If its properly defined, try deleting everything in the JWKs table via Drizzle Studio. I have no idea if this is actually needed, but it worked for me in the past.
