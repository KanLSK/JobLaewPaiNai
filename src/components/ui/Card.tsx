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

/** `fill` stretches the card to its grid slot and lets the body push content to the bottom. */
export function Card({ stage, header, fill = false, children }: { stage: StageId; header: React.ReactNode; fill?: boolean; children?: React.ReactNode }) {
  return (
    <article className={`overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-sticker ${fill ? "flex h-full flex-col" : ""}`}>
      <header className={`border-b-2 border-ink ${fill ? "px-3 py-2" : "px-4 py-3"} ${STAGE_BG[stage]}`}>{header}</header>
      <div className={fill ? "flex flex-1 flex-col gap-2 p-3" : "space-y-3 p-4"}>{children}</div>
    </article>
  );
}
