import Link from "next/link";
import { contributeHref } from "@/components/contribute/topics";
import { Empty } from "@/components/reviews/Results";
import { Card } from "@/components/ui/Card";
import { findStep } from "@/config/pathway";
import type { NoteEntry } from "@/lib/data/types";
import type { Result } from "./data";

interface Props {
  result: Result;
  /** Resident reviews, one list per entry of result.specialties. */
  notes: NoteEntry[][];
  canContribute?: boolean;
}

const button = "rounded-full border-2 border-ink px-4 py-2 font-semibold shadow-sticker-sm";

export function QuizResult({ result, notes, canContribute = false }: Props) {
  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-10">
      <div className="space-y-3 rounded-3xl border-2 border-ink bg-resident p-6 text-center shadow-sticker">
        <p className="font-semibold">หมอที่เหมาะกับคุณคือ…</p>
        <p aria-hidden className="text-6xl">{result.emoji}</p>
        <h1 className="text-3xl font-bold text-balance">{result.title}</h1>
        <p className="leading-relaxed">{result.line}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/guide/quiz" className={`${button} bg-graduate`}>เล่นอีกรอบ</Link>
        {result.more && <Link href={result.more.href} className={`${button} bg-white`}>{result.more.label}</Link>}
        <Link href="/guide" className={`${button} bg-white`}>กลับไปคู่มือ</Link>
      </div>
      {result.specialties.map((id, i) => (
        <section key={id} className="space-y-3">
          <h2 className="text-xl font-bold">รีวิวจาก Resident · {findStep(id)!.label}</h2>
          {notes[i]?.map((note) => (
            <Card key={note.id} stage="resident" header={<h3 className="font-bold break-words">{note.title}</h3>}>
              <p className="text-sm leading-relaxed break-words whitespace-pre-line">{note.text}</p>
            </Card>
          ))}
          {!notes[i]?.length && <Empty>ยังไม่มีรีวิว</Empty>}
          {canContribute && (
            <Link href={contributeHref("resident", id)} className="block text-sm font-semibold underline">เขียนรีวิวสาขานี้</Link>
          )}
        </section>
      ))}
    </div>
  );
}
