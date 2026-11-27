import { ALL_STEPS, findStep } from "@/config/pathway";
import type { ElectiveReview, HospitalReview, NoteEntry } from "@/lib/data/types";

export interface StepContent {
  electives: ElectiveReview[];
  hospitals: HospitalReview[];
  notes: NoteEntry[];
}

export function contentFor(stepId: string, electives: ElectiveReview[], hospitals: HospitalReview[], notes: NoteEntry[] = []): StepContent {
  return { ...reviewsFor(stepId, electives, hospitals), notes: notes.filter((n) => n.stepId === stepId) };
}

function reviewsFor(stepId: string, electives: ElectiveReview[], hospitals: HospitalReview[]): Omit<StepContent, "notes"> {
  const step = findStep(stepId);
  if (stepId === "elective") return { electives, hospitals: [] };
  if (stepId === "intern") return { electives: [], hospitals };
  if (step?.parentId === "elective") {
    const department = stepId === "elective-other" ? null : stepId.slice("elective-".length);
    return { electives: electives.filter((e) => e.specialtyId === department), hospitals: [] };
  }
  if (step?.parentId === "intern") return { electives: [], hospitals: hospitals.filter((h) => h.trackId === stepId) };
  if (step?.parentId === "resident")
    return {
      electives: electives.filter((e) => e.specialtyId === stepId),
      hospitals: hospitals.filter((h) => h.specialtyId === stepId),
    };
  return { electives: [], hospitals: [] };
}

export function countByStep(electives: ElectiveReview[], hospitals: HospitalReview[], notes: NoteEntry[] = []): Record<string, number> {
  return Object.fromEntries(
    ALL_STEPS.map((step) => {
      const content = contentFor(step.id, electives, hospitals, notes);
      return [step.id, content.electives.length + content.hospitals.length + content.notes.length];
    }),
  );
}
