"use client";

export interface Select {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  all?: string;
  onChange: (value: string) => void;
}

const field = "w-full min-w-0 rounded-xl border-2 border-ink bg-white px-3 py-2 text-base";

export function FilterBar({ text, onText, selects }: { text: string; onText: (v: string) => void; selects: Select[] }) {
  return (
    <div role="search" className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <input type="search" aria-label="ค้นหา" placeholder="ค้นหา…" value={text} onChange={(e) => onText(e.target.value)} className={field} />
      {selects.map((s) => (
        <select key={s.label} aria-label={s.label} value={s.value} onChange={(e) => s.onChange(e.target.value)} className={field}>
          <option value="">{s.all ?? `${s.label}: ทั้งหมด`}</option>
          {s.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
