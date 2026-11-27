import { ALL_STEPS, findStep } from "@/config/pathway";
import type { ElectiveReview, HospitalReview, NoteEntry } from "@/lib/data/types";
import type { Where } from "@/lib/entries/types";

export interface StepContent {
  electives: ElectiveReview[];
  hospitals: HospitalReview[];
  notes: NoteEntry[];
}

/** Which reviews a step shows: absent means none, an empty filter means all of that kind. */
export function stepQueries(stepId: string): { elective?: Where; hospital?: Where; note?: Where } {
  const step = findStep(stepId);
  if (!step) return {};
  const note = { stepId };
  if (stepId === "elective") return { elective: {}, note };
  if (stepId === "intern") return { hospital: {}, note };
  if (step.parentId === "elective")
    return { elective: { specialtyId: stepId === "elective-other" ? null : stepId.slice("elective-".length) }, note };
  if (step.parentId === "intern") return { hospital: { trackId: stepId }, note };
  if (step.parentId === "resident") return { elective: { specialtyId: stepId }, hospital: { specialtyId: stepId }, note };
  return { note };
}

/** What counting needs to know about a review. */
export interface Placed {
  electives: { specialtyId: string | null }[];
  hospitals: { trackId: string | null; specialtyId: string | null }[];
  notes: { stepId: string }[];
}

const matching = <T extends object>(list: T[], where: Where | undefined): T[] =>
  where ? list.filter((item) => Object.entries(where).every(([key, value]) => (item as Record<string, unknown>)[key] === value)) : [];

function select<E extends object, H extends object, N extends object>(stepId: string, electives: E[], hospitals: H[], notes: N[]) {
  const q = stepQueries(stepId);
  return { electives: matching(electives, q.elective), hospitals: matching(hospitals, q.hospital), notes: matching(notes, q.note) };
}

export function contentFor(stepId: string, electives: ElectiveReview[], hospitals: HospitalReview[], notes: NoteEntry[] = []): StepContent {
  return select(stepId, electives, hospitals, notes);
}

export function countByStep(electives: Placed["electives"], hospitals: Placed["hospitals"], notes: Placed["notes"] = []): Record<string, number> {
  return Object.fromEntries(
    ALL_STEPS.map((step) => {
      const content = select(step.id, electives, hospitals, notes);
      return [step.id, content.electives.length + content.hospitals.length + content.notes.length];
    }),
  );
}
