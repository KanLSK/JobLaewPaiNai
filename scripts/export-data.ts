// Data/*.csv -> Data/cleaned/*.csv (private columns and Data/redactions.tsv applied) -> content/reviews.json.
// Ids listed in config/exclude.txt are left out of the site. The original files are never changed.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { cleanTable, parseRedactions, toCsv } from "../src/lib/data/clean";
import { buildAliases } from "../src/lib/data/aliases";
import { csvSource } from "../src/lib/data/csvSource";
import { BMSMO_FILE, parseBMSMOFile } from "../src/lib/data/bmsmo";
import { CSV_FILES, createRepository } from "../src/lib/data/repository";
import { takeSnapshot } from "../src/lib/data/snapshot";

// Required, so that a missing list can never publish unredacted text.
const redactions = parseRedactions(readFileSync("Data/redactions.tsv", "utf8"));

mkdirSync("Data/cleaned", { recursive: true });
const cleaned = (file: string) => path.join("Data", "cleaned", file);

for (const [table, prefix, headerRows] of [["si129", "SI129", 1], ["si130", "SI130", 1], ["hospitals", "H", 4]] as const) {
  const lines: string[][] = parse(readFileSync(path.join("Data", CSV_FILES[table]), "utf8"), { bom: true, relax_column_count: true });
  writeFileSync(cleaned(CSV_FILES[table]), "\uFEFF" + toCsv(cleanTable(lines, prefix, headerRows, redactions)));
}

writeFileSync(cleaned(BMSMO_FILE), "\uFEFF" + toCsv(cleanTable(parse(readFileSync(path.join("Data", BMSMO_FILE), "utf8"), { bom: true }), "BM64", 1, redactions)));

const exclude = existsSync("config/exclude.txt")
  ? readFileSync("config/exclude.txt", "utf8").split("\n").map((l) => l.split("#")[0].trim()).filter(Boolean)
  : [];

const source = csvSource({
  si129: cleaned(CSV_FILES.si129),
  si130: cleaned(CSV_FILES.si130),
  hospitals: cleaned(CSV_FILES.hospitals),
  aliases: "config/aliases.csv",
});
const aliases = buildAliases(parse(readFileSync("config/aliases.csv", "utf8"), { bom: true, columns: true }));
const booklet = parseBMSMOFile(readFileSync(cleaned(BMSMO_FILE), "utf8"), aliases);
const forms = createRepository(source, { approveAll: true });
const snapshot = await takeSnapshot(
  {
    getElectiveReviews: async () => [...(await forms.getElectiveReviews()), ...booklet],
    getHospitalReviews: forms.getHospitalReviews,
  },
  exclude,
);
mkdirSync("content", { recursive: true });
writeFileSync("content/reviews.json", JSON.stringify(snapshot, null, 1));
console.log(`${redactions.length} redactions; content/reviews.json: ${snapshot.electives.length} electives, ${snapshot.hospitals.length} hospital reviews`);
