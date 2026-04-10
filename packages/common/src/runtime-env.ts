import { AsyncLocalStorage } from "node:async_hooks";

type RuntimeEnv = Record<string, unknown>;

const runtimeEnvStorage = new AsyncLocalStorage<RuntimeEnv>();

function getProcessEnv(): RuntimeEnv {
  if (typeof process === "undefined") {
    return {};
  }
  return process.env;
}

export function runWithRuntimeEnv<T>(runtimeEnv: RuntimeEnv, fn: () => T): T {
  return runtimeEnvStorage.run(runtimeEnv, fn);
}

export function getRuntimeEnv(): RuntimeEnv {
  return runtimeEnvStorage.getStore() ?? getProcessEnv();
}

export function getOptionalEnv(key: string): string | undefined {
  const value = getRuntimeEnv()[key];
  return typeof value === "string" ? value : undefined;
}

export function getEnvValue(key: string): string {
  return getOptionalEnv(key) ?? "";
}

export function getRequiredEnv(key: string): string {
  const value = getOptionalEnv(key);
  if (!value) {
    throw new Error(`${key} is not set`);
  }
  return value;
}

export function getBinding<T>(key: string): T {
  const value = getRuntimeEnv()[key];
  if (value == null) {
    throw new Error(`${key} binding is not set`);
  }
  return value as T;
}

export function isDevelopment() {
  return getEnvValue("NODE_ENV") === "development";
}
