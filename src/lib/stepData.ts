import { CAREERS, SPECIALTIES, STAGES, TRACKS, findStep } from "@/config/pathway";
import type { ElectiveReview, HospitalReview } from "@/lib/data/types";

export interface StepContent {
  electives: ElectiveReview[];
  hospitals: HospitalReview[];
}

export function contentFor(stepId: string, electives: ElectiveReview[], hospitals: HospitalReview[]): StepContent {
  const step = findStep(stepId);
  if (stepId === "elective") return { electives, hospitals: [] };
  if (stepId === "intern") return { electives: [], hospitals };
  if (step?.parentId === "intern") return { electives: [], hospitals: hospitals.filter((h) => h.trackId === stepId) };
  if (step?.parentId === "resident")
    return {
      electives: electives.filter((e) => e.specialtyId === stepId),
      hospitals: hospitals.filter((h) => h.specialtyId === stepId),
    };
  return { electives: [], hospitals: [] };
}

export function countByStep(electives: ElectiveReview[], hospitals: HospitalReview[]): Record<string, number> {
  return Object.fromEntries(
    [...STAGES, ...TRACKS, ...SPECIALTIES, ...CAREERS].map((step) => {
      const content = contentFor(step.id, electives, hospitals);
      return [step.id, content.electives.length + content.hospitals.length];
    }),
  );
}
