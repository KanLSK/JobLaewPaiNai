import { mongoStore } from "./mongo";
import type { EntryStore, RateStore } from "./types";

type Env = Record<string, string | undefined>;

export const mongoConfigured = (env: Env): boolean => env.DATA_SOURCE === "mongodb" && Boolean(env.MONGODB_URI);

export const databaseName = (env: Env) => env.MONGODB_DB || "joblaew";

let store: (EntryStore & RateStore) | null = null;

export function getStore(): EntryStore & RateStore {
  if (!process.env.MONGODB_URI) throw new Error("Missing environment variable MONGODB_URI");
  store ??= mongoStore(process.env.MONGODB_URI, databaseName(process.env));
  return store;
}
