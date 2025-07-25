import { exec } from "shared/exec";

// eslint-disable-next-line no-console -- taken from ztunes
console.log("Cleaning up resources...");

try {
  exec("rm -f /tmp/ztunes.db*");
} catch (err) {
  // @ts-expect-error -- taken from ztunes
  // eslint-disable-next-line no-console -- taken from ztunes
  console.info(err.message);
}

try {
  exec("docker rm -f ztunes");
} catch (err) {
  // @ts-expect-error -- taken from ztunes
  // eslint-disable-next-line no-console -- taken from ztunes
  console.info(err.message);
}
// eslint-disable-next-line no-console -- taken from ztunes
console.log("Cleanup complete.");
