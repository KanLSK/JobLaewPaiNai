import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ReviewText } from "@/components/ui/ReviewText";
import { Score } from "@/components/ui/Score";
import type { HospitalReview } from "@/lib/data/types";
import { hospitalHref } from "@/lib/hospitals";

export function HospitalCard({ review }: { review: HospitalReview }) {
  const overall = review.scores[review.scores.length - 1];
  return (
    <Card
      stage="intern"
      header={
        <>
          <div className="mb-1 flex flex-wrap gap-1.5">
            <Chip>ใช้ทุน</Chip>
            {review.trackRaw && <Chip>{review.trackRaw}</Chip>}
            {review.departmentRaw && <Chip>{review.departmentRaw}</Chip>}
          </div>
          <h3 className="text-lg font-bold break-words">
            <Link href={hospitalHref(review.hospital)} className="underline decoration-2 underline-offset-4">{review.hospital}</Link>
          </h3>
        </>
      }
    >
      {overall && <Score score={overall} />}
      {review.summary && <ReviewText text={review.summary} />}
      <details>
        <summary className="cursor-pointer text-sm font-semibold underline">คะแนนรายด้าน</summary>
        <ul className="mt-2 space-y-1">
          {review.scores.map((s) => (
            <li key={s.label}>
              <Score score={s} />
            </li>
          ))}
        </ul>
      </details>
    </Card>
  );
}
