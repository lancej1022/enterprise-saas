# README

## Docker

`docker run --name drizzle-postgres -e POSTGRES_PASSWORD=mypassword -d -p 5432:5432 postgres:17`

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

`npx drizzle-kit generate` -> Generate migrations (this should be run AFTER the better auth CLI generate from the above step^^)

`npx drizzle-kit migrate` -> apply migrations
