import { SPECIALTIES, TRACKS } from "@/config/pathway";
import type { ElectiveReview, HospitalReview, NoteEntry, Score } from "@/lib/data/types";
import type { Entry } from "@/lib/entries/types";
import { LONG, NOTE_STEPS, SHORT } from "@/lib/entries/validate";

export interface Field {
  name: string;
  label: string;
  value: string;
  type: "line" | "area" | "score" | "choice";
  options?: { value: string; label: string }[];
  max: number;
  required?: boolean;
}

const options = (list: { id: string; label: string }[]) => [{ value: "", label: "ไม่ระบุ" }, ...list.map((s) => ({ value: s.id, label: s.label }))];
const line = (name: string, label: string, value: string | null, required = false): Field => ({ name, label, value: value ?? "", type: "line", max: SHORT, required });
const area = (name: string, label: string, value: string | null, required = false): Field => ({ name, label, value: value ?? "", type: "area", max: LONG, required });
const score = (name: string, s: Score): Field => ({ name, label: `${s.label} (1–${s.max})`, value: s.value === null ? "" : String(s.value), type: "score", max: s.max });
const choice = (name: string, label: string, value: string | null, list: { id: string; label: string }[], required = false): Field => ({
  name, label, value: value ?? "", type: "choice", options: options(list), max: SHORT, required,
});

/** Every field an entry has, in the order shown on the approval page. */
export function fields(entry: Entry): Field[] {
  if (entry.kind === "elective") {
    const d = entry.data as Omit<ElectiveReview, "id">;
    return [
      line("hospital", "โรงพยาบาล", d.hospital, true),
      line("year", "รุ่น", d.year, true),
      line("ward", "วอร์ด", d.wardRaw),
      choice("department", "ภาควิชา", d.specialtyId, SPECIALTIES),
      score("overall", d.overall),
      ...d.extra.map((s, i) => score(`extra${i}`, s)),
      ...d.sections.map((s, i) => area(`section${i}`, s.label, s.text)),
      line("province", "จังหวัด", d.province),
      line("threeWords", "3 คำ", d.threeWords),
    ];
  }
  if (entry.kind === "hospital") {
    const d = entry.data as Omit<HospitalReview, "id">;
    return [
      line("hospital", "โรงพยาบาล", d.hospital, true),
      choice("track", "Track", d.trackId, TRACKS),
      choice("department", "ภาควิชา", d.specialtyId, SPECIALTIES),
      ...d.scores.map((s, i) => score(`s${i}`, s)),
      area("summary", "รีวิวภาพรวม", d.summary),
    ];
  }
  const d = entry.data as Omit<NoteEntry, "id">;
  return [choice("step", "ขั้นตอน", d.stepId, NOTE_STEPS, true), line("title", "หัวข้อ", d.title, true), area("text", "เนื้อหา", d.text, true)];
}
