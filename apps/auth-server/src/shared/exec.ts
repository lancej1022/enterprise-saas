import { execSync } from "child_process";
import type { ExecSyncOptions } from "child_process";

export function exec(command: string, options?: ExecSyncOptions) {
  // eslint-disable-next-line no-console -- taken from ztunes
  console.log(`> ${command}`);
  return execSync(command, { stdio: "inherit", ...options });
}
