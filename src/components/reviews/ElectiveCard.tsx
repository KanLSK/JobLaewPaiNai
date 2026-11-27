import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Score } from "@/components/ui/Score";
import type { ElectiveReview } from "@/lib/data/types";

/** A fixed-shape preview; `onOpen` receives the button so focus can come back to it. */
export function ElectiveCard({ review, onOpen }: { review: ElectiveReview; onOpen: (from: HTMLElement) => void }) {
  const preview = review.sections[0]?.text.replace(/\n\s*\n/g, "\n");
  return (
    <Card
      fill
      stage="elective"
      header={
        <>
          <div className="mb-1 flex flex-wrap gap-1.5">
            <Chip>Elective</Chip>
            <Chip>{review.year}</Chip>
            {review.province && <Chip>{review.province}</Chip>}
          </div>
          <h3 className="line-clamp-1 text-lg font-bold break-all">{review.wardRaw || "ไม่ระบุวอร์ด"}</h3>
          <p className="line-clamp-1 text-sm break-all">{review.hospital}</p>
        </>
      }
    >
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Score score={{ ...review.overall, label: "ภาพรวม" }} />
        {review.extra.map((s) => (
          <Score key={s.label} score={s} />
        ))}
      </div>
      {/* Three lines are always reserved, so cards match however much was written. */}
      <div className="min-h-[4.875rem]">
        {preview ? (
          <p className="line-clamp-3 text-sm leading-relaxed whitespace-pre-line break-words">{preview}</p>
        ) : (
          <p className="text-sm text-muted">ยังไม่มีรีวิวที่เขียนไว้</p>
        )}
      </div>
      <button type="button" onClick={(e) => onOpen(e.currentTarget)} className="mt-auto cursor-pointer self-start text-sm font-semibold underline">
        อ่านรีวิวเต็ม →
      </button>
    </Card>
  );
}
