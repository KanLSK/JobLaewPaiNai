import type { HospitalReview } from "@/lib/data/types";

export const REGIONS = [
  { id: "north", label: "ภาคเหนือ", color: "var(--color-extern)" },
  { id: "northeast", label: "ภาคตะวันออกเฉียงเหนือ", color: "var(--color-graduate)" },
  { id: "central", label: "ภาคกลาง", color: "var(--color-elective)" },
  { id: "east", label: "ภาคตะวันออก", color: "var(--color-resident)" },
  { id: "west", label: "ภาคตะวันตก", color: "var(--color-other)" },
  { id: "south", label: "ภาคใต้", color: "var(--color-intern)" },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];
export const isRegion = (id: unknown): id is RegionId => REGIONS.some((r) => r.id === id);

/** One row of the ใช้ทุน hospital list. */
export interface DirectoryHospital {
  name: string;
  region: string;
  province: string;
  gp: boolean;
  specialties: string[];
  /** A short condition written instead of a department list. */
  note?: string;
  review?: string;
}

// "รพ" is only a prefix: it also occurs inside names such as สรรพสิทธิประสงค์.
const key = (name: string) => name.trim().replace(/^(โรงพยาบาล|รพ\.?)/, "").replace(/จังหวัด|จ\.|\s/g, "");

/** Matches scored reviews to listed hospitals: listed name → name used by the reviews. */
export function placeReviews(hospitals: DirectoryHospital[], reviews: HospitalReview[]) {
  const found = new Map<string, string>();
  const unplaced: HospitalReview[] = [];
  for (const review of reviews) {
    const wanted = key(review.hospital);
    const hit = hospitals.find((h) => wanted === key(h.name) || wanted === key(h.name) + h.province);
    if (hit) found.set(hit.name, review.hospital);
    else unplaced.push(review);
  }
  return { found, unplaced };
}
