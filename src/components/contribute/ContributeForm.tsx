"use client";

import { useActionState, useState } from "react";
import { SPECIALTIES, TRACKS } from "@/config/pathway";
import { HOSPITAL_SCORE_HEADERS } from "@/lib/data/columns";
import type { SubmitResult } from "@/lib/entries/submit";
import type { Kind } from "@/lib/entries/types";
import { LONG, NOTE_STEPS, SHORT } from "@/lib/entries/validate";

export type FormState = (SubmitResult & { kind: Kind; attempt: number }) | null;

const TABS: [Kind, string][] = [
  ["elective", "Elective"],
  ["hospital", "โรงพยาบาลใช้ทุน"],
  ["note", "เส้นทางอื่น"],
];
const box = "w-full min-w-0 rounded-xl border-2 border-ink bg-white px-3 py-2 text-base";
const button = "cursor-pointer rounded-full border-2 border-ink px-4 py-2 font-semibold";

interface Props {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  hospitals: string[];
  initialKind: Kind;
  initialStep?: string;
}

export function ContributeForm(props: Props) {
  const [kind, setKind] = useState<Kind>(props.initialKind);
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={kind === id} onClick={() => setKind(id)} className={`${button} ${kind === id ? "bg-graduate" : "bg-white"}`}>
            {label}
          </button>
        ))}
      </div>
      <datalist id="hospital-names">
        {props.hospitals.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      {/* All three stay on the page, so looking at another tab loses nothing. */}
      {TABS.map(([id]) => (
        <div key={id} hidden={kind !== id}>
          <KindForm {...props} kind={id} initialStep={id === props.initialKind ? props.initialStep : undefined} />
        </div>
      ))}
    </>
  );
}

function KindForm({ action, kind, initialStep }: Props & { kind: Kind }) {
  const [state, send, pending] = useActionState(action, null);
  const [sent, setSent] = useState(0);

  const failed = state && !state.ok ? state : null;
  const done = state?.ok && state.attempt !== sent;
  const errors = failed?.errors ?? {};
  const value = (name: string, start = "") => failed?.values[name] ?? start;

  const field = (name: string, label: string, control: React.ReactNode, hint?: string) => (
    <div>
      <label htmlFor={`${kind}-${name}`} className="mb-1 block font-semibold">{label}</label>
      {control}
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {errors[name] && <p role="alert" className="text-sm font-semibold text-red-700">{errors[name]}</p>}
    </div>
  );
  // No maxLength: a long paste must be reported, not silently cut.
  const input = (name: string, label: string, required = false, hint?: string, list?: string) =>
    field(name, label, <input id={`${kind}-${name}`} name={name} required={required} list={list} defaultValue={value(name)} className={box} />, hint ?? `ไม่เกิน ${SHORT} ตัวอักษร`);
  const area = (name: string, label: string, required = false) =>
    field(name, label, <textarea id={`${kind}-${name}`} name={name} required={required} rows={5} defaultValue={value(name)} className={box} />, `ไม่เกิน ${LONG} ตัวอักษร`);
  const select = (name: string, label: string, options: { value: string; label: string }[], required = false, start = "") =>
    field(
      name,
      label,
      <select id={`${kind}-${name}`} name={name} required={required} defaultValue={value(name, start)} className={box}>
        <option value="">{required ? "เลือก…" : "ไม่ระบุ"}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>,
    );
  const score = (name: string, label: string, required = false) =>
    select(name, `${label} (1–5)`, [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) })), required);
  const steps = (list: { id: string; label: string }[]) => list.map((s) => ({ value: s.id, label: s.label }));
  const departments = [...steps(SPECIALTIES), { value: "other", label: "อื่นๆ" }];
  const hospital = input("hospital", "โรงพยาบาล", true, "พิมพ์หรือเลือกจากรายการ", "hospital-names");

  return (
    <>
      {done ? (
        <div role="status" className="space-y-3 rounded-2xl border-2 border-ink bg-white p-4">
          <p className="font-bold">ได้รับแล้ว รอตรวจสอบ ขอบคุณครับ</p>
          <button type="button" onClick={() => setSent(state.attempt)} className={`${button} bg-white`}>ส่งอีกรายการ</button>
        </div>
      ) : (
        // Remounted for every reply, so the typed values come back after React resets the form.
        <form key={state?.attempt ?? 0} action={send} className="space-y-4">
          <input type="hidden" name="kind" value={kind} />
          <div aria-hidden className="absolute -left-[9999px]">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {failed && <p role="alert" className="rounded-xl border-2 border-ink bg-intern px-3 py-2 font-semibold">{failed.message}</p>}

          {kind === "elective" && (
            <>
              {input("year", "รุ่น", true, "เช่น SI131")}
              {hospital}
              {select("department", "ภาควิชา", departments, true)}
              {input("ward", "ชื่อวอร์ด")}
              {score("overall", "ความพึงพอใจในภาพรวม", true)}
              {score("learned", "ความรู้ใหม่")}
              {score("chill", "ความชิล")}
              {area("review", "รีวิว Elective", true)}
              {area("advice", "ฝากถึงน้องๆ")}
            </>
          )}
          {kind === "hospital" && (
            <>
              {hospital}
              {select("track", "Track", steps(TRACKS), true, initialStep)}
              {select("department", "ภาควิชา", departments)}
              {HOSPITAL_SCORE_HEADERS.map((label, i) => (
                <div key={label}>{score(`s${i}`, label, i === HOSPITAL_SCORE_HEADERS.length - 1)}</div>
              ))}
              {area("summary", "รีวิวภาพรวม (ข้อดี ข้อเสีย สิ่งที่ประทับใจ)")}
            </>
          )}
          {kind === "note" && (
            <>
              {select("step", "เส้นทางหรือขั้นตอน", steps(NOTE_STEPS), true, initialStep)}
              {input("title", "หัวข้อ", true)}
              {area("text", "เล่าประสบการณ์", true)}
            </>
          )}

          <label className="flex items-start gap-2">
            <input type="checkbox" name="consent" required defaultChecked={Boolean(value("consent"))} className="mt-1 size-4" />
            <span>ฉันยืนยันว่าข้อความนี้ไม่มีชื่อบุคคล เบอร์ติดต่อ หรือข้อมูลผู้ป่วย</span>
          </label>
          {errors.consent && <p role="alert" className="text-sm font-semibold text-red-700">{errors.consent}</p>}

          <button type="submit" disabled={pending} className={`${button} bg-graduate shadow-sticker-sm disabled:opacity-60`}>
            {pending ? "กำลังส่ง…" : "ส่งรีวิว"}
          </button>
        </form>
      )}
    </>
  );
}
