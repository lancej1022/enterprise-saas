import { createConnection } from "net";
import { concurrently } from "concurrently";
import { must } from "shared/must";

import "shared/env";

const devPgAddress = must(
  process.env.DEV_PG_ADDRESS,
  "DEV_PG_ADDRESS is required",
);

/** Checks if a port is alreadyin use */
function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createConnection(port, "localhost");

    server.on("connect", () => {
      server.destroy();
      resolve(true); // Port is in use
    });

    server.on("error", () => {
      resolve(false); // Port is not in use
    });
  });
}

/** Parses the PostgreSQL address and returns the Postgres port */
function parsePgAddress(address: string): number {
  const match = /:(\d+)$/.exec(address);
  if (!match?.[1]) {
    throw new Error(`Invalid PostgreSQL address format: ${address}`);
  }
  return Number(match[1]);
}

async function checkPorts(): Promise<boolean> {
  const pgPort = parsePgAddress(devPgAddress);
  const vitePort = 5173;

  const [pgInUse, viteInUse] = await Promise.all([
    isPortInUse(pgPort),
    isPortInUse(vitePort),
  ]);

  if (pgInUse && viteInUse) {
    process.stdout.write(`✅ Both ports are already in use:\n`);
    process.stdout.write(`   - PostgreSQL (${pgPort})\n`);
    process.stdout.write(`   - Vite (${vitePort})\n`);
    process.stdout.write(`Skipping concurrently execution.\n`);
    return true;
  }

  return false;
}

async function main() {
  const bothPortsInUse = await checkPorts();

  if (bothPortsInUse) {
    process.exit(0);
  }

  concurrently([
    {
      command: "npm run dev:clean && npm run dev:db",
      name: "postgres",
      prefixColor: "#32648c",
    },
    { command: "npm run dev:ui", name: "vite", prefixColor: "#7ce645" },
    {
      command: `wait-on tcp:${devPgAddress} && sleep 1 && npx drizzle-kit push --force && npm run seed`,
      name: "seed-script",
      prefixColor: "#005fec",
    },
    {
      command: `wait-on tcp:${devPgAddress} && sleep 1 && npm run dev:zero`,
      name: "zero",
      prefixColor: "#ff11cc",
    },
    {
      command:
        "chokidar 'db/schema.ts' 'auth/schema.ts' -c 'npm run generate-zero-schema'",
      name: "generate-zero-schema",
      prefixColor: "#11ffcc",
    },
  ]);
}

main().catch((error) => {
  console.error("Error running dev script:", error);
  process.exit(1);
});
