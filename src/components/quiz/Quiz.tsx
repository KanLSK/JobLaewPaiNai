"use client";

import Link from "next/link";
import { useState } from "react";
import { NODES, RESULTS, START } from "./data";

const option = "block w-full rounded-2xl border-2 border-ink bg-white p-4 text-left text-lg font-semibold shadow-sticker-sm transition hover:-translate-y-0.5 hover:bg-graduate";
const small = "rounded-full border-2 border-ink bg-white px-3 py-1 text-sm font-semibold";

export function Quiz() {
  const [path, setPath] = useState([START]);
  const current = NODES[path[path.length - 1]];

  return (
    <div className="mx-auto max-w-xl space-y-5 pb-10">
      <Link href="/guide" className="text-sm font-semibold underline">← คู่มือ</Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold">เรียนต่ออะไรดี?</h1>
        <p className="text-muted">เล่นขำๆ ไม่ใช่แบบทดสอบจริงจัง</p>
      </div>
      <div aria-live="polite" className="space-y-4 rounded-3xl border-2 border-ink bg-resident p-5 shadow-sticker">
        <p className="text-sm font-semibold">ข้อที่ {path.length}</p>
        <h2 className="text-2xl font-bold text-balance">{current.question}</h2>
        <ul className="space-y-3">
          {current.answers.map(({ label, to }) => (
            <li key={`${path.length}-${to}`}>
              {RESULTS[to] ? (
                <Link href={`/guide/quiz/${to}`} className={option}>{label}</Link>
              ) : (
                <button type="button" onClick={() => setPath([...path, to])} className={option}>{label}</button>
              )}
            </li>
          ))}
        </ul>
      </div>
      {path.length > 1 && (
        <div className="flex justify-between gap-2">
          <button type="button" onClick={() => setPath(path.slice(0, -1))} className={small}>← ย้อนกลับ</button>
          <button type="button" onClick={() => setPath([START])} className={small}>เริ่มใหม่</button>
        </div>
      )}
      <p className="text-center text-xs text-muted">ดัดแปลงจากผัง “เรียนต่ออะไรดี?” โดย Metro.</p>
    </div>
  );
}
