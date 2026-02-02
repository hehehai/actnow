import { resolve } from "node:path";
import { config } from "dotenv";

// Load .env from apps/web before importing db
config({ path: resolve(import.meta.dirname, "../../../apps/web/.env") });

async function seed() {
  // Dynamic import after dotenv is loaded
  const { db } = await import("./index");
  const { runAllSeeds } = await import("./seeds");

  await runAllSeeds(db);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
