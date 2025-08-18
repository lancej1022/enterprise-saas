import { createConnection } from "net";
import { concurrently } from "concurrently";

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

async function checkPorts(): Promise<boolean> {
  const vitePort = 5173;

  const [viteInUse] = await Promise.all([isPortInUse(vitePort)]);

  if (viteInUse) {
    process.stdout.write(`✅ Both ports are already in use:\n`);
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
    { command: "npm run dev:ui", name: "vite", prefixColor: "#7ce645" },
  ]);
}

main().catch((error) => {
  console.error("Error running dev script:", error);
  process.exit(1);
});
