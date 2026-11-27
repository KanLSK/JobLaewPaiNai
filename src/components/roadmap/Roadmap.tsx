import { CAREERS, ELECTIVE_DEPARTMENTS, SPECIALTIES, TRACKS, findStep, type Step } from "@/config/pathway";
import { Branch } from "./Branch";
import { StepNode } from "./StepNode";

const Spine = () => <div aria-hidden className="h-10 border-l-4 border-dotted border-ink" />;

// Horizontal connector from a side branch to the spine (desktop only).
const LINK = "md:after:absolute md:after:top-1/2 md:after:w-8 md:after:border-t-4 md:after:border-dotted md:after:border-ink md:after:content-['']";

export function Roadmap({ counts, selected }: { counts: Record<string, number>; selected: Step | null }) {
  const node = (id: string) => <StepNode step={findStep(id)!} count={counts[id] ?? 0} big />;
  const list = (steps: Step[], className: string, itemClass = "relative") => (
    <ul className={className}>
      {steps.map((s) => (
        <li key={s.id} className={itemClass}>
          <StepNode step={s} count={counts[s.id] ?? 0} />
        </li>
      ))}
    </ul>
  );
  const holds = (parent: string) => selected?.parentId === parent;
  const wards = ELECTIVE_DEPARTMENTS.filter((s) => (counts[s.id] ?? 0) > 0);

  /** A stage on the spine with its branches split to either side. */
  const hub = (id: string, label: string, steps: Step[], toggle: string, spineAbove = true) => {
    const half = Math.ceil(steps.length / 2);
    return (
      <section aria-label={label} className="grid w-full justify-items-center md:grid-cols-[1fr_16rem_1fr] md:items-center md:gap-x-8">
        <div className="relative md:col-start-2 md:row-start-1 md:flex md:w-full md:items-center md:self-stretch">
          {/* Carries the spine past the hub. */}
          <div aria-hidden className={`absolute bottom-0 left-1/2 hidden -translate-x-1/2 border-l-4 border-dotted border-ink md:block ${spineAbove ? "top-0" : "top-1/2"}`} />
          <div className="mx-auto w-64 max-w-full">{node(id)}</div>
        </div>
        {steps.length > 0 && (
          <Branch label={toggle} defaultOpen={holds(id)} className="md:contents" desktop="md:contents">
            <div className="grid gap-3 md:contents">
              {list(steps.slice(0, half), "grid gap-3 md:col-start-1 md:row-start-1", `relative ${LINK} md:after:-right-8`)}
              {list(steps.slice(half), "grid gap-3 md:col-start-3 md:row-start-1", `relative ${LINK} md:after:-left-8`)}
            </div>
          </Branch>
        )}
      </section>
    );
  };

  return (
    <div className="flex flex-col items-center pb-10">
      {hub("elective", "Elective", wards, `${wards.length} ภาควิชา`, false)}
      <Spine />
      {node("extern")}
      <Spine />
      {node("graduate")}
      <Spine />

      {hub("intern", "ใช้ทุน", TRACKS, `${TRACKS.length} tracks`)}

      <Spine />
      <p className="rounded-full border-2 border-ink bg-ink px-5 py-2 font-display font-bold text-paper">◆ เลือกเส้นทาง</p>
      <Spine />

      <div className="grid w-full items-start gap-8 md:grid-cols-2 md:border-t-4 md:border-dotted md:border-ink md:pt-6">
        <section aria-label="Resident" className="flex flex-col items-center gap-3">
          {node("resident")}
          <Branch label={`${SPECIALTIES.length} สาขา`} defaultOpen={holds("resident")}>
            {list(SPECIALTIES, "grid grid-cols-2 gap-3")}
          </Branch>
        </section>
        <section aria-label="เส้นทางอื่น" className="flex flex-col items-center gap-3">
          {node("other")}
          <Branch label={`${CAREERS.length} เส้นทาง`} defaultOpen={holds("other")}>
            {list(CAREERS, "grid grid-cols-2 gap-3")}
          </Branch>
        </section>
      </div>
    </div>
  );
}
