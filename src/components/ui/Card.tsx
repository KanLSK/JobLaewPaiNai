import type { StageId } from "@/config/pathway";

// Literal class names so Tailwind can see them.
export const STAGE_BG: Record<StageId, string> = {
  elective: "bg-elective",
  extern: "bg-extern",
  graduate: "bg-graduate",
  intern: "bg-intern",
  resident: "bg-resident",
  other: "bg-other",
};

export function Card({ stage, header, children }: { stage: StageId; header: React.ReactNode; children?: React.ReactNode }) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-sticker">
      <header className={`border-b-2 border-ink px-4 py-3 ${STAGE_BG[stage]}`}>{header}</header>
      <div className="space-y-3 p-4">{children}</div>
    </article>
  );
}
