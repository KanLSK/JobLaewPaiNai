import type { Entry, EntryStore, Kind } from "@/lib/entries/types";
import { cached } from "./cache";
import type { ReviewRepository } from "./repository";
import type { ElectiveReview, HospitalReview, NoteEntry } from "./types";

/** Form entries newest first, then the imported file in its own order. */
function arrange(entries: Entry[]) {
  const written = entries.filter((e) => !e.importId).reverse();
  return [...written, ...entries.filter((e) => e.importId)];
}

/** Only approved entries are ever asked for. */
export function mongoRepository(store: EntryStore, ttlMs = 60_000): ReviewRepository {
  const read = <T>(kind: Kind) =>
    cached(async () => arrange(await store.list("approved", kind)).map((e) => ({ ...e.data, id: e.importId ?? e.id }) as T), ttlMs);
  return {
    getElectiveReviews: read<ElectiveReview>("elective"),
    getHospitalReviews: read<HospitalReview>("hospital"),
    getNotes: read<NoteEntry>("note"),
  };
}
