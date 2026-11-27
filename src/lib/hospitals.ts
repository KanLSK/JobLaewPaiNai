import type { HospitalReview } from "@/lib/data/types";

export const hospitalHref = (name: string) => `/hospitals/${encodeURIComponent(name)}`;

export function reviewsForHospital(param: string, list: HospitalReview[]): { name: string; reviews: HospitalReview[] } | null {
  let decoded: string | null = null;
  try {
    decoded = decodeURIComponent(param);
  } catch {
    // A malformed escape can still be a literal name.
  }
  const name = list.find((r) => r.hospital === decoded || r.hospital === param)?.hospital;
  return name ? { name, reviews: list.filter((r) => r.hospital === name) } : null;
}
