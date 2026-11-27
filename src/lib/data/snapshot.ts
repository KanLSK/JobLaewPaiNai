import { readFile } from "node:fs/promises";
import type { ReviewRepository } from "./repository";
import type { ElectiveReview, HospitalReview } from "./types";
import { withViews } from "./views";

/** What the site shows, already parsed: it holds no column the pages do not display. */
export interface Snapshot {
  electives: ElectiveReview[];
  hospitals: HospitalReview[];
}

export async function takeSnapshot(repository: Pick<ReviewRepository, "getElectiveReviews" | "getHospitalReviews">, exclude: string[]): Promise<Snapshot> {
  const keep = (review: { id: string }) => !exclude.includes(review.id);
  return {
    electives: (await repository.getElectiveReviews()).filter(keep),
    hospitals: (await repository.getHospitalReviews()).filter(keep),
  };
}

export function fileRepository(file: string): ReviewRepository {
  const load = async (): Promise<Snapshot> => {
    try {
      return JSON.parse(await readFile(file, "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { electives: [], hospitals: [] };
      throw error;
    }
  };
  return withViews({
    getElectiveReviews: async () => (await load()).electives,
    getHospitalReviews: async () => (await load()).hospitals,
    getNotes: async () => [],
  });
}
