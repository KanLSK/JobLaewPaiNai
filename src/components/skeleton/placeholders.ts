import { ELECTIVE_DEPARTMENTS } from "@/config/pathway";
import { HOSPITAL_SCORE_HEADERS } from "@/lib/data/columns";
import type { ElectiveReview, HospitalReview } from "@/lib/data/types";

// Stand-ins shaped like real data. The words are never readable inside a skeleton.
const filler = "กำลังโหลดข้อความรีวิว ".repeat(6).trim();
const six = Array.from({ length: 6 }, (_, i) => i);

/** Which wards have reviews is not known yet, so draw six branches a side. */
export const mapCounts: Record<string, number> = Object.fromEntries(ELECTIVE_DEPARTMENTS.slice(0, 12).map((s) => [s.id, 1]));

export const electives: ElectiveReview[] = six.map((i) => ({
  id: `placeholder-${i}`,
  year: "SI000",
  hospital: "โรงพยาบาล",
  wardRaw: "ชื่อวอร์ด",
  specialtyId: null,
  overall: { label: "ภาพรวม", value: 5, max: 5 },
  extra: [{ label: "ความรู้ใหม่", value: 5, max: 5 }, { label: "ความชิล", value: 5, max: 5 }],
  sections: [{ label: "รีวิว", text: filler }],
  threeWords: null,
  province: null,
}));

export const hospitals: HospitalReview[] = six.map((i) => ({
  id: `placeholder-${i}`,
  hospital: "โรงพยาบาล",
  summary: filler,
  scores: HOSPITAL_SCORE_HEADERS.map((label) => ({ label, value: 3, max: 5 })),
  trackId: null,
  trackRaw: "track",
  specialtyId: null,
  departmentRaw: "ภาควิชา",
}));
