import type { Entry, EntryStore, Kind, Where } from "@/lib/entries/types";
import { countByStep, stepQueries, type StepContent } from "@/lib/stepData";
import { cached } from "./cache";
import type { ReviewRepository } from "./repository";
import type { ElectiveReview, HospitalReview, NoteEntry } from "./types";
import { sortNames } from "./views";

/** Form entries newest first, then the imported file in its own order. */
function arrange(entries: Entry[]) {
  const written = entries.filter((e) => !e.importId).reverse();
  return [...written, ...entries.filter((e) => e.importId)];
}

/** Only approved entries are ever asked for. */
export function mongoRepository(store: EntryStore, ttlMs = 60_000): ReviewRepository {
  const read = <T>(kind: Kind, where?: Where) =>
    cached(async () => {
      const entries = await (where ? store.list("approved", kind, where) : store.list("approved", kind));
      return arrange(entries).map((e) => ({ ...e.data, id: e.importId ?? e.id }) as T);
    }, ttlMs);
  const places = cached(() => store.places("approved"), ttlMs);

  // One cache per step; only real steps get here, so there are few of them.
  const steps = new Map<string, () => Promise<StepContent>>();
  const stepReader = (stepId: string) => {
    const q = stepQueries(stepId);
    const part = <T>(kind: Kind, where: Where | undefined) =>
      where ? read<T>(kind, Object.keys(where).length ? where : undefined) : async () => [] as T[];
    const electives = part<ElectiveReview>("elective", q.elective);
    const hospitals = part<HospitalReview>("hospital", q.hospital);
    const notes = part<NoteEntry>("note", q.note);
    return async () => {
      const [e, h, n] = await Promise.all([electives(), hospitals(), notes()]);
      return { electives: e, hospitals: h, notes: n };
    };
  };

  return {
    getElectiveReviews: read<ElectiveReview>("elective"),
    getHospitalReviews: read<HospitalReview>("hospital"),
    getNotes: read<NoteEntry>("note"),
    async getStepCounts() {
      const all = await places();
      const of = (kind: Kind) => all.filter((p) => p.kind === kind);
      return countByStep(of("elective") as never, of("hospital") as never, of("note") as never);
    },
    async getStepReviews(stepId) {
      if (!Object.keys(stepQueries(stepId)).length) return { electives: [], hospitals: [], notes: [] };
      if (!steps.has(stepId)) steps.set(stepId, stepReader(stepId));
      return steps.get(stepId)!();
    },
    async getHospitalNames() {
      return sortNames((await places()).flatMap((p) => (p.hospital ? [p.hospital] : [])));
    },
  };
}
