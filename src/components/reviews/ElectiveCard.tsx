import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ReviewText } from "@/components/ui/ReviewText";
import { Score } from "@/components/ui/Score";
import type { ElectiveReview } from "@/lib/data/types";

export function ElectiveCard({ review }: { review: ElectiveReview }) {
  const [first, ...rest] = review.sections;
  const section = (s: ElectiveReview["sections"][number]) => (
    <div key={s.label}>
      <h4 className="text-sm font-semibold">{s.label}</h4>
      <ReviewText text={s.text} />
    </div>
  );
  return (
    <Card
      stage="elective"
      header={
        <>
          <div className="mb-1 flex flex-wrap gap-1.5">
            <Chip>Elective</Chip>
            <Chip>{review.year}</Chip>
            {review.province && <Chip>{review.province}</Chip>}
          </div>
          <h3 className="text-lg font-bold break-words">{review.wardRaw || "ไม่ระบุวอร์ด"}</h3>
          <p className="text-sm break-words">{review.hospital}</p>
        </>
      }
    >
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {[review.overall, ...review.extra].map((s) => (
          <Score key={s.label} score={s} />
        ))}
      </div>
      {review.threeWords && <p className="font-display break-words">“{review.threeWords}”</p>}
      {first && section(first)}
      {rest.length > 0 && (
        <details className="space-y-3">
          <summary className="cursor-pointer text-sm font-semibold underline">อ่านเพิ่ม</summary>
          <div className="mt-3 space-y-3">{rest.map(section)}</div>
        </details>
      )}
    </Card>
  );
}
