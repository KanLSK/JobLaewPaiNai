import type { ElectiveReview, HospitalReview } from "@/lib/data/types";

const includes = (parts: (string | null)[], text: string | undefined) =>
  !text?.trim() || parts.join("\n").toLowerCase().includes(text.trim().toLowerCase());

const ratio = (r: ElectiveReview) => (r.overall.value === null ? -1 : r.overall.value / r.overall.max);

export function filterElectives(
  list: ElectiveReview[],
  q: { text?: string; hospital?: string; specialtyId?: string; year?: string; sort?: "score" | "hospital" },
): ElectiveReview[] {
  const out = list.filter(
    (r) =>
      (!q.hospital || r.hospital === q.hospital) &&
      (!q.specialtyId || r.specialtyId === q.specialtyId) &&
      (!q.year || r.year === q.year) &&
      includes([r.hospital, r.wardRaw, r.province, r.threeWords, ...r.sections.map((s) => s.text)], q.text),
  );
  if (q.sort === "score") out.sort((a, b) => ratio(b) - ratio(a));
  if (q.sort === "hospital") out.sort((a, b) => a.hospital.localeCompare(b.hospital, "th"));
  return out;
}

export function filterHospitals(
  list: HospitalReview[],
  q: { text?: string; trackId?: string; specialtyId?: string },
): HospitalReview[] {
  return list.filter(
    (r) =>
      (!q.trackId || r.trackId === q.trackId) &&
      (!q.specialtyId || r.specialtyId === q.specialtyId) &&
      includes([r.hospital, r.summary, r.departmentRaw, r.trackRaw], q.text),
  );
}
