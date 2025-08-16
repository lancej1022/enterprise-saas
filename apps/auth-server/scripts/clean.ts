import { exec } from "#/shared/exec";

// eslint-disable-next-line no-console -- taken from hono-server
console.log("Cleaning up resources...");

try {
  exec("rm -f /tmp/hono-server.db*");
} catch (err) {
  // @ts-expect-error -- taken from hono-server
  // eslint-disable-next-line no-console -- taken from hono-server
  console.info(err.message);
}

try {
  exec("docker rm -f hono-server");
} catch (err) {
  // @ts-expect-error -- taken from hono-server
  // eslint-disable-next-line no-console -- taken from hono-server
  console.info(err.message);
}
// eslint-disable-next-line no-console -- taken from hono-server
console.log("Cleanup complete.");
