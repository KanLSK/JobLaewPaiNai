// Writes content/reviews.json from the CSVs in Data/. Ids listed in config/exclude.txt are left out.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRepository, localCsv } from "../src/lib/data/repository";
import { takeSnapshot } from "../src/lib/data/snapshot";

const exclude = (() => {
  try {
    return readFileSync("config/exclude.txt", "utf8").split("\n").map((l) => l.split("#")[0].trim()).filter(Boolean);
  } catch {
    return [];
  }
})();

const snapshot = await takeSnapshot(createRepository(localCsv(), { approveAll: true }), exclude);
mkdirSync("content", { recursive: true });
writeFileSync("content/reviews.json", JSON.stringify(snapshot, null, 1));
console.log(`content/reviews.json: ${snapshot.electives.length} electives, ${snapshot.hospitals.length} hospital reviews, ${exclude.length} excluded`);
