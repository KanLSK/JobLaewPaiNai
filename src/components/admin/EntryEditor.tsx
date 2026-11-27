"use client";

import { useActionState } from "react";
import type { Field } from "@/lib/admin/fields";
import { highlight } from "@/lib/admin/highlight";
import type { Status } from "@/lib/entries/types";
import type { FieldErrors } from "@/lib/entries/validate";

export type EditorState = { attempt: number; ok: boolean; message: string; errors: FieldErrors; values: Record<string, string> } | null;

interface Props {
  action: (previous: EditorState, formData: FormData) => Promise<EditorState>;
  id: string;
  status: Status;
  heading: string;
  fields: Field[];
  version: string;
}

const box = "mt-1 w-full min-w-0 rounded-xl border-2 border-ink bg-white px-3 py-2";
const button = "cursor-pointer rounded-full border-2 border-ink px-3 py-1 text-sm font-semibold disabled:opacity-60";

const Marked = ({ text }: { text: string }) => (
  <>
    {highlight(text).map((part, i) => (part.flagged ? <mark key={i} className="bg-graduate font-semibold">{part.text}</mark> : <span key={i}>{part.text}</span>))}
  </>
);

export function EntryEditor({ action, id, status, heading, fields, version }: Props) {
  const [state, send, pending] = useActionState(action, null);
  const errors = state?.errors ?? {};
  // Typed text is restored only while the entry is still the one it was typed over.
  const value = (f: Field) => (state && !state.ok && state.values.version === version ? (state.values[f.name] ?? f.value) : f.value);
  const shown = (f: Field) => (f.type === "choice" ? (f.options!.find((o) => o.value === f.value)?.label ?? f.value) : f.value);
  const act = (intent: string, label: string, color = "bg-white", ask?: string) => (
    <button
      type="submit"
      name="intent"
      value={intent}
      disabled={pending}
      onClick={(e) => {
        if (ask && !window.confirm(ask)) e.preventDefault();
      }}
      className={`${button} ${color}`}
    >
      {label}
    </button>
  );

  return (
    <article className="space-y-3 rounded-2xl border-2 border-ink bg-white p-4">
      <h2 className="font-bold break-words">{heading}</h2>
      <dl className="space-y-2 text-sm">
        {fields.filter((f) => f.value).map((f) => (
          <div key={f.name}>
            <dt className="font-semibold text-muted">{f.label}</dt>
            <dd className="break-words whitespace-pre-line"><Marked text={shown(f)} /></dd>
          </div>
        ))}
      </dl>
      <form key={`${version}-${state?.attempt ?? 0}`} action={send} className="space-y-3">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="version" value={version} />
        {state && <p role="status" className={`font-semibold ${state.ok ? "" : "text-red-700"}`}>{state.message}</p>}
        {/* Closed or open, these are sent with the buttons below. */}
        <details open={Object.keys(errors).length > 0}>
          <summary className="cursor-pointer font-semibold underline">แก้ไข</summary>
          <div className="mt-2 space-y-3">
            {fields.map((f) => (
              <label key={f.name} className="block text-sm font-semibold">
                {f.label}
                {f.type === "area" ? (
                  <textarea name={f.name} rows={6} defaultValue={value(f)} className={box} />
                ) : f.type === "choice" ? (
                  <select name={f.name} defaultValue={value(f)} className={box}>
                    {f.options!.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input name={f.name} defaultValue={value(f)} className={box} />
                )}
                {errors[f.name] && <span role="alert" className="text-red-700">{errors[f.name]}</span>}
              </label>
            ))}
          </div>
        </details>
        {/* Pressing Enter in a field saves; it never approves or deletes. */}
        <button type="submit" name="intent" value="save" aria-hidden tabIndex={-1} className="sr-only">บันทึก</button>
        <div className="flex flex-wrap gap-2">
          {status !== "approved" && act("approve", "บันทึกและอนุมัติ", "bg-resident")}
          {act("save", "บันทึก")}
          {status === "pending" && act("reject", "ไม่อนุมัติ")}
          {status === "approved" && act("unpublish", "เอาออกจากเว็บ", "bg-intern")}
          {act("delete", "ลบถาวร", "bg-white", "ลบรายการนี้ถาวร? กู้คืนไม่ได้")}
        </div>
      </form>
    </article>
  );
}
