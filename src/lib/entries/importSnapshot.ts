import type { Snapshot } from "@/lib/data/snapshot";
import type { EntryStore, Kind } from "./types";

/** Adds what the database has never seen; edits and deletions made there are left alone. */
export async function importSnapshot(store: EntryStore, snapshot: Snapshot): Promise<{ added: number; skipped: number }> {
  const reviews = [
    ...snapshot.electives.map((review) => ["elective" as Kind, review] as const),
    ...snapshot.hospitals.map((review) => ["hospital" as Kind, review] as const),
  ];
  let added = 0;
  for (const [index, [kind, { id, ...data }]] of reviews.entries()) {
    // createdAt only keeps the order of the file.
    if (await store.addImport({ kind, status: "approved", source: "import", importId: id, data, createdAt: new Date(index) })) added++;
  }
  return { added, skipped: reviews.length - added };
}
