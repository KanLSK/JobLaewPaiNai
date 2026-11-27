import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Score } from "@/components/ui/Score";
import type { HospitalReview } from "@/lib/data/types";
import { hospitalHref } from "@/lib/hospitals";

/** A fixed-shape summary; the full review and the ten scores are on the hospital's page. */
export function HospitalCard({ review }: { review: HospitalReview }) {
  const overall = review.scores[review.scores.length - 1];
  const href = hospitalHref(review.hospital);
  return (
    <Card
      fill
      stage="intern"
      header={
        <>
          <div className="mb-1 flex flex-wrap gap-1.5">
            <Chip>ใช้ทุน</Chip>
            {review.trackRaw && <Chip>{review.trackRaw}</Chip>}
            {review.departmentRaw && <Chip>{review.departmentRaw}</Chip>}
          </div>
          <h3 className="line-clamp-2 text-lg font-bold break-words">
            <Link href={href} className="underline decoration-2 underline-offset-4">{review.hospital}</Link>
          </h3>
        </>
      }
    >
      {overall && <Score score={overall} />}
      {/* Three lines are always reserved, so cards match with or without text. */}
      <div className="min-h-[4.875rem]">
        {review.summary ? (
          <p className="line-clamp-3 text-sm leading-relaxed whitespace-pre-line break-words">{review.summary.replace(/\n\s*\n/g, "\n")}</p>
        ) : (
          <p className="text-sm text-muted">ยังไม่มีรีวิวภาพรวม</p>
        )}
      </div>
      <Link href={href} className="mt-auto text-sm font-semibold underline">ดูรีวิวและคะแนนทั้งหมด →</Link>
    </Card>
  );
}
