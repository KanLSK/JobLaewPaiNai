import Link from "next/link";
import { guideHref } from "@/components/guide/topics";
import type { StepContent } from "@/lib/stepData";
import type { Path } from "./paths";
import { StepNode } from "./StepNode";
import { StepPopup } from "./StepPopup";

interface Props {
  page: Path;
  stepId?: string;
  counts: Record<string, number>;
  content: StepContent;
  canContribute?: boolean;
}

export function PathPage({ page, stepId, counts, content, canContribute = false }: Props) {
  const step = page.steps.find((s) => s.id === stepId) ?? null;

  return (
    <>
      <div inert={step !== null} className="mx-auto max-w-4xl space-y-5 pb-10">
        <Link href="/" className="inline-block text-sm font-semibold underline">← กลับไปแผนผัง</Link>
        <div className={`rounded-3xl border-2 border-ink p-5 text-center shadow-sticker-sm ${page.color}`}>
          <h1 className="text-3xl font-bold">{page.title}</h1>
          <p>{page.intro}</p>
        </div>
        <nav aria-label="อ่านในคู่มือ" className="flex flex-wrap justify-center gap-2 text-sm font-semibold">
          {page.guides.map(([label, id]) => (
            <Link key={id} href={guideHref(id)} className="rounded-full border-2 border-ink bg-white px-3 py-1 hover:bg-graduate">{label} →</Link>
          ))}
        </nav>
        <ul className="grid grid-cols-2 items-start gap-3 md:grid-cols-3">
          {page.steps.map((s) => (
            <li key={s.id}>
              <StepNode step={s} count={counts[s.id] ?? 0} base={page.base} />
            </li>
          ))}
        </ul>
      </div>
      {step && <StepPopup step={step} content={content} canContribute={canContribute} base={page.base} />}
    </>
  );
}
