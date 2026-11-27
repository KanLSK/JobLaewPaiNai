import { contentFor, countByStep } from "@/lib/stepData";
import type { ElectiveReview, HospitalReview, NoteEntry } from "./types";

export interface Lists {
  getElectiveReviews(): Promise<ElectiveReview[]>;
  getHospitalReviews(): Promise<HospitalReview[]>;
  getNotes(): Promise<NoteEntry[]>;
}

export const sortNames = (names: string[]) => [...new Set(names)].sort((a, b) => a.localeCompare(b, "th"));

/** For sources read from memory or a file, where taking everything costs nothing extra. */
export function withViews(lists: Lists) {
  const all = () => Promise.all([lists.getElectiveReviews(), lists.getHospitalReviews(), lists.getNotes()]);
  return {
    ...lists,
    getStepCounts: async () => countByStep(...(await all())),
    getStepReviews: async (stepId: string) => contentFor(stepId, ...(await all())),
    getHospitalNames: async () => {
      const [electives, hospitals] = await all();
      return sortNames([...electives, ...hospitals].map((r) => r.hospital));
    },
  };
}
