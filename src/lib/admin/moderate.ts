import { SPECIALTIES, TRACKS } from "@/config/pathway";
import { canonical, type Aliases } from "@/lib/data/aliases";
import type { ElectiveReview, HospitalReview, NoteEntry, Score } from "@/lib/data/types";
import type { Entry, EntryData, EntryStore, Status } from "@/lib/entries/types";
import type { FieldErrors } from "@/lib/entries/validate";
import { fields, type Field } from "./fields";

export const GONE = "ไม่พบรายการนี้แล้ว";

export const toForm = (entry: Entry): Record<string, string> => Object.fromEntries(fields(entry).map((f) => [f.name, f.value]));

export const setStatus = (store: EntryStore, id: string, status: Status) => store.update(id, { status });

export const destroy = (store: EntryStore, id: string) => store.remove(id);

const clean = (value: string) => value.replace(/\r\n/g, "\n").trim();

/** Only changed fields are checked and written, so imported text that breaks today's limits stays editable. */
function changes(entry: Entry, form: Record<string, string>) {
  const changed: Record<string, string> = {};
  const errors: FieldErrors = {};
  const check = (f: Field, value: string) => {
    if (f.required && !value) return "ต้องกรอก";
    if (f.type === "score") return value && !(/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= f.max) ? `ให้คะแนน 1–${f.max}` : null;
    if (f.type === "choice") return f.options!.some((o) => o.value === value) ? null : "กรุณาเลือกจากรายการ";
    return value.length > f.max ? `ยาวเกิน ${f.max} ตัวอักษร` : null;
  };
  for (const f of fields(entry)) {
    if (!(f.name in form)) continue;
    const value = clean(form[f.name]);
    if (value === clean(f.value)) continue;
    const error = check(f, value);
    if (error) errors[f.name] = error;
    else changed[f.name] = value;
  }
  return { changed, errors };
}

function patch(entry: Entry, changed: Record<string, string>, aliases: Aliases): EntryData {
  const text = (name: string, old: string) => changed[name] ?? old;
  const optional = (name: string, old: string | null) => (name in changed ? changed[name] || null : old);
  const scored = (name: string, s: Score): Score => (name in changed ? { ...s, value: changed[name] ? Number(changed[name]) : null } : s);
  const hospital = (old: string) => ("hospital" in changed ? canonical(aliases, "hospital", changed.hospital) : old);
  const label = (list: { id: string; label: string }[], id: string) => list.find((s) => s.id === id)?.label ?? "";

  if (entry.kind === "elective") {
    const d = entry.data as Omit<ElectiveReview, "id">;
    return {
      ...d,
      hospital: hospital(d.hospital),
      year: text("year", d.year),
      wardRaw: text("ward", d.wardRaw),
      specialtyId: optional("department", d.specialtyId),
      overall: scored("overall", d.overall),
      extra: d.extra.map((s, i) => scored(`extra${i}`, s)),
      // Emptying a section removes it.
      sections: d.sections.map((s, i) => ({ ...s, text: text(`section${i}`, s.text) })).filter((s) => s.text),
      province: optional("province", d.province),
      threeWords: optional("threeWords", d.threeWords),
    };
  }
  if (entry.kind === "hospital") {
    const d = entry.data as Omit<HospitalReview, "id">;
    return {
      ...d,
      hospital: hospital(d.hospital),
      summary: optional("summary", d.summary),
      scores: d.scores.map((s, i) => scored(`s${i}`, s)),
      ...("track" in changed && { trackId: changed.track || null, trackRaw: label(TRACKS, changed.track) }),
      ...("department" in changed && { specialtyId: changed.department || null, departmentRaw: label(SPECIALTIES, changed.department) }),
    };
  }
  const d = entry.data as Omit<NoteEntry, "id">;
  return { stepId: text("step", d.stepId), title: text("title", d.title), text: text("text", d.text) };
}

export async function saveEdit(
  store: EntryStore,
  aliases: Aliases,
  id: string,
  form: Record<string, string>,
): Promise<{ ok: boolean; message: string; errors?: FieldErrors }> {
  const entry = await store.get(id);
  if (!entry) return { ok: false, message: GONE };
  const { changed, errors } = changes(entry, form);
  if (Object.keys(errors).length) return { ok: false, message: "ยังไม่ได้บันทึก กรุณาตรวจช่องที่ระบุ", errors };
  if (!Object.keys(changed).length) return { ok: true, message: "บันทึกแล้ว" };
  const ok = await store.update(id, { data: patch(entry, changed, aliases) });
  return { ok, message: ok ? "บันทึกแล้ว" : GONE };
}
