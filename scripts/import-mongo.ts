// content/reviews.json (already redacted) -> MongoDB, as approved entries. Safe to run again.
import { readFileSync } from "node:fs";
import { databaseName } from "../src/lib/entries";
import { importSnapshot } from "../src/lib/entries/importSnapshot";
import { mongoStore } from "../src/lib/entries/mongo";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Set MONGODB_URI in .env.local");
const store = mongoStore(uri, databaseName(process.env));
try {
  const { added, skipped } = await importSnapshot(store, JSON.parse(readFileSync("content/reviews.json", "utf8")));
  console.log(`database "${databaseName(process.env)}": added ${added}, skipped ${skipped}`);
} finally {
  await store.close();
}
