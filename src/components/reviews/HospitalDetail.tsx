import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ReviewText } from "@/components/ui/ReviewText";
import type { HospitalReview } from "@/lib/data/types";

export function HospitalDetail({ found }: { found: { name: string; reviews: HospitalReview[] } }) {
  return (
    <>
      <Link href="/hospitals" className="text-sm underline">← โรงพยาบาลทั้งหมด</Link>
      <h1 className="my-4 text-3xl font-bold break-words">{found.name}</h1>
      <div className="grid items-start gap-5 md:grid-cols-2">
        {found.reviews.map((review) => (
          <Card
            key={review.id}
            stage="intern"
            header={
              <div className="flex flex-wrap gap-1.5">
                <Chip>{review.trackRaw || "ไม่ระบุ track"}</Chip>
                {review.departmentRaw && <Chip>{review.departmentRaw}</Chip>}
              </div>
            }
          >
            {review.summary ? <ReviewText text={review.summary} /> : <p className="text-sm text-muted">ยังไม่มีรีวิวภาพรวม</p>}
            <ul className="space-y-2">
              {review.scores.map((s) => (
                <li key={s.label} className="text-sm">
                  <div className="flex justify-between gap-3">
                    <span>{s.label}</span>
                    <strong className="whitespace-nowrap">{s.value === null ? "–" : `${s.value}/${s.max}`}</strong>
                  </div>
                  <div aria-hidden className="mt-1 h-3 overflow-hidden rounded-full border-2 border-ink bg-paper">
                    <div className="h-full bg-intern" style={{ width: `${((s.value ?? 0) / s.max) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
