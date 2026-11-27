import Link from "next/link";
import type { Step } from "@/config/pathway";
import { STAGE_BG } from "@/components/ui/Card";

/** Stages that only point the way and hold no reviews themselves. */
const SIGNPOSTS = new Set(["graduate", "resident", "other"]);

/** `base` is the page the pop-up opens on. */
export function StepNode({ step, count, big = false, base = "/" }: { step: Step; count: number; big?: boolean; base?: string }) {
  const signpost = SIGNPOSTS.has(step.id);
  const empty = !signpost && count === 0;
  return (
    <Link
      href={`${base}?step=${step.id}`}
      scroll={false}
      data-step={step.id}
      className={[
        "relative z-10 block w-full rounded-2xl border-2 border-ink text-center break-words transition hover:-translate-y-0.5 hover:rotate-[-0.5deg]",
        big ? "max-w-xs px-5 py-3 font-display text-xl font-bold" : "px-3 py-2 text-sm font-semibold",
        empty ? "border-dashed bg-paper" : `${STAGE_BG[step.stage]} shadow-sticker-sm`,
      ].join(" ")}
    >
      <span>{step.label}</span>
      {!signpost && (
        <span className="mt-0.5 block font-sans text-xs font-normal text-muted">{empty ? "รอข้อมูล" : `${count} รีวิว`}</span>
      )}
    </Link>
  );
}
