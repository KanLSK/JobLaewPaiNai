import { CAREERS, NO_SERVICE, SPECIALTIES, STAGES, TRACKS, type Step } from "@/config/pathway";
import { canonical, type Aliases } from "@/lib/data/aliases";
import { HOSPITAL_SCORE_HEADERS } from "@/lib/data/columns";
import type { Score } from "@/lib/data/types";
import type { EntryData, Kind } from "./types";

export type FieldErrors = Record<string, string>;
export const SHORT = 120;
export const LONG = 5000;

/** Elective and hospital experiences have their own forms. */
export const NOTE_STEPS: Step[] = [...STAGES.filter((s) => s.id !== "elective"), ...TRACKS, ...NO_SERVICE, ...SPECIALTIES, ...CAREERS];

/** Reads trimmed values and collects one message per bad field. */
function reader(form: Record<string, string>) {
  const errors: FieldErrors = {};
  const raw = (name: string) => (form[name] ?? "").trim();
  const text = (name: string, max: number, required = false) => {
    const value = raw(name);
    if (required && !value) errors[name] = "กรุณากรอกข้อมูล";
    else if (value.length > max) errors[name] = `ยาวเกิน ${max} ตัวอักษร`;
    return value;
  };
  const score = (name: string, label: string, required = false): Score => {
    const value = raw(name);
    if (!value) {
      if (required) errors[name] = "กรุณาให้คะแนน";
      return { label, value: null, max: 5 };
    }
    const n = Number(value);
    if (!/^[1-5]$/.test(value)) errors[name] = "ให้คะแนน 1–5";
    return { label, value: n, max: 5 };
  };
  const choice = (name: string, steps: Step[], required = false): Step | null => {
    const value = raw(name);
    const found = steps.find((s) => s.id === value) ?? null;
    if (!found && (value || required)) errors[name] = "กรุณาเลือกจากรายการ";
    return found;
  };
  const department = () => (raw("department") === "other" ? { id: null, label: "อื่นๆ" } : choice("department", SPECIALTIES));
  const sections = (entries: [string, string][]) => entries.flatMap(([label, value]) => (value ? [{ label, text: value }] : []));
  return { errors, raw, text, score, choice, department, sections };
}

export function validate(
  kind: Kind,
  form: Record<string, string>,
  aliases: Aliases,
): { ok: true; data: EntryData } | { ok: false; errors: FieldErrors } {
  const r = reader(form);
  const hospital = () => canonical(aliases, "hospital", r.text("hospital", SHORT, true));
  let data: EntryData;

  if (kind === "elective") {
    const year = r.raw("year").toUpperCase();
    if (!/^SI\d{3}$/.test(year)) r.errors.year = "เช่น SI131";
    const department = r.department();
    if (!r.raw("department")) r.errors.department = "กรุณาเลือกจากรายการ";
    data = {
      year,
      hospital: hospital(),
      wardRaw: r.text("ward", SHORT) || department?.label || "",
      specialtyId: department?.id ?? null,
      overall: r.score("overall", "ความพึงพอใจในภาพรวม", true),
      extra: [r.score("learned", "ความรู้ใหม่"), r.score("chill", "ความชิล")],
      sections: r.sections([["รีวิว Elective", r.text("review", LONG, true)], ["ฝากถึงน้องๆ", r.text("advice", LONG)]]),
      threeWords: null,
      province: null,
    };
  } else if (kind === "hospital") {
    const track = r.choice("track", TRACKS, true);
    const department = r.department();
    data = {
      hospital: hospital(),
      summary: r.text("summary", LONG) || null,
      scores: HOSPITAL_SCORE_HEADERS.map((label, i) => r.score(`s${i}`, label, i === HOSPITAL_SCORE_HEADERS.length - 1)),
      trackId: track?.id ?? null,
      trackRaw: track?.label ?? "",
      specialtyId: department?.id ?? null,
      departmentRaw: department?.label ?? "",
    };
  } else {
    const step = r.choice("step", NOTE_STEPS, true);
    data = { stepId: step?.id ?? "", title: r.text("title", SHORT, true), text: r.text("text", LONG, true) };
  }

  if (!r.raw("consent")) r.errors.consent = "กรุณายืนยันก่อนส่ง";
  return Object.keys(r.errors).length ? { ok: false, errors: r.errors } : { ok: true, data };
}
