import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "smol-toml";

const APPS_WEB_DIR = resolve(import.meta.dirname, "../../../apps/web");
const WRANGLER_CONFIG_PATH = resolve(APPS_WEB_DIR, "wrangler.toml");
const WRANGLER_STATE_DIR = resolve(APPS_WEB_DIR, ".wrangler/state/v3");

type WranglerD1Database = {
  binding: string;
  database_id: string;
};

type WranglerConfig = {
  d1_databases?: WranglerD1Database[];
  env?: Record<
    string,
    {
      d1_databases?: WranglerD1Database[];
    }
  >;
};

async function readWranglerConfig() {
  const content = await readFile(WRANGLER_CONFIG_PATH, "utf8");
  return parse(content) as WranglerConfig;
}

export async function getLocalD1BindingConfig() {
  const config = await readWranglerConfig();
  const envName = process.env.CLOUDFLARE_ENV ?? "development";
  const scopedConfig = config.env?.[envName];
  const database =
    scopedConfig?.d1_databases?.find((entry) => entry.binding === "DB") ??
    config.d1_databases?.find((entry) => entry.binding === "DB");

  if (!database) {
    throw new Error(`DB binding is not configured in ${WRANGLER_CONFIG_PATH}`);
  }

  return {
    binding: database.binding,
    databaseId: database.database_id,
    persistRoot: WRANGLER_STATE_DIR,
  };
}

export async function createLocalD1Database() {
  const { Miniflare } = await import("miniflare");
  const { binding, databaseId, persistRoot } = await getLocalD1BindingConfig();

  const mf = new Miniflare({
    modules: true,
    script: "export default {};",
    d1Databases: {
      [binding]: databaseId,
    },
    defaultPersistRoot: persistRoot,
    d1Persist: true,
  });

  return {
    binding,
    database: await mf.getD1Database(binding),
    dispose: () => mf.dispose(),
  };
}
