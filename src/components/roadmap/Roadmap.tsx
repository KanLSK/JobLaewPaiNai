import { CAREERS, ELECTIVE_DEPARTMENTS, SPECIALTIES, findStep, type Step } from "@/config/pathway";
import { Branch } from "./Branch";
import { StepNode } from "./StepNode";

const Spine = () => <div aria-hidden className="h-10 border-l-4 border-dotted border-ink" />;

/** A labelled box for one part of the flowchart. */
function Group({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className={`flex w-full flex-col items-center gap-3 rounded-3xl border-2 border-ink p-3 ${className}`}>
      <p className="text-center font-display font-bold">{label}</p>
      {children}
    </div>
  );
}

/** The years that follow one choice, top to bottom. */
function Years({ title, steps }: { title?: string; steps: string[] }) {
  return (
    <div className="flex w-full flex-col items-center text-center text-sm">
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <ol className="flex w-full flex-col items-center">
        {steps.map((step, i) => (
          <li key={step} className="flex w-full flex-col items-center">
            {i > 0 && <span aria-hidden>↓</span>}
            <span className="rounded-xl border border-ink bg-paper px-2 py-1">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

type Side = "left" | "right";

/** Lines joining one branch to the trunk on the hub's side (desktop only). */
function Wires({ side, first, last }: { side: Side; first: boolean; last: boolean }) {
  // The trunk sits 2rem out from the node; it covers half of each 0.75rem gap so it is unbroken.
  const trunk = side === "left" ? "left-[calc(100%+2rem)] -translate-x-1/2" : "right-[calc(100%+2rem)] translate-x-1/2";
  return (
    <>
      <span aria-hidden data-wire="stub" className={`absolute top-1/2 hidden h-[3px] w-8 -translate-y-1/2 bg-ink md:block ${side === "left" ? "left-full" : "right-full"}`} />
      <span aria-hidden data-wire="trunk" className={`absolute hidden w-[3px] bg-ink md:block ${trunk} ${first ? "top-[calc(50%-1.5px)]" : "-top-1.5"} ${last ? "bottom-[calc(50%-1.5px)]" : "-bottom-1.5"}`} />
    </>
  );
}

export function Roadmap({ counts, selected }: { counts: Record<string, number>; selected: Step | null }) {
  const node = (id: string) => <StepNode step={findStep(id)!} count={counts[id] ?? 0} big />;
  const list = (steps: Step[], className: string, side?: Side) => (
    <ul className={className}>
      {steps.map((s, i) => (
        <li key={s.id} className="relative">
          {side && <Wires side={side} first={i === 0} last={i === steps.length - 1} />}
          <StepNode step={s} count={counts[s.id] ?? 0} />
        </li>
      ))}
    </ul>
  );
  const track = (id: string) => <StepNode step={findStep(id)!} count={counts[id] ?? 0} />;
  const holds = (parent: string) => selected?.parentId === parent;
  const wards = ELECTIVE_DEPARTMENTS.filter((s) => (counts[s.id] ?? 0) > 0);

  /** A stage on the spine with its branches split to either side. */
  const hub = (id: string, label: string, steps: Step[], toggle: string, spineAbove = true) => {
    const half = Math.ceil(steps.length / 2);
    return (
      <section aria-label={label} className="grid w-full justify-items-center md:grid-cols-[1fr_20rem_1fr] md:items-center md:gap-x-8">
        <div className="relative md:col-start-2 md:row-start-1 md:flex md:w-full md:items-center md:self-stretch">
          {/* Carries the spine past the hub. */}
          <div aria-hidden className={`absolute bottom-0 left-1/2 hidden -translate-x-1/2 border-l-4 border-dotted border-ink md:block ${spineAbove ? "top-0" : "top-1/2"}`} />
          {(["left", "right"] as const).slice(0, Math.min(steps.length, 2)).map((side) => (
            <span key={side} aria-hidden data-wire={`link-${side}`} className={`absolute top-1/2 hidden h-[3px] w-8 -translate-y-1/2 bg-ink md:block ${side === "left" ? "left-0" : "right-0"}`} />
          ))}
          <div className="mx-auto w-64 max-w-full">{node(id)}</div>
        </div>
        {steps.length > 0 && (
          <Branch label={toggle} defaultOpen={holds(id)} className="md:contents" desktop="md:contents">
            <div className="grid w-full gap-3 md:contents">
              {list(steps.slice(0, half), "grid w-full gap-3 md:col-start-1 md:row-start-1", "left")}
              {list(steps.slice(half), "grid w-full gap-3 md:col-start-3 md:row-start-1", "right")}
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

      <div className="relative grid w-full items-start gap-4 lg:grid-cols-[3fr_1fr] lg:pt-6">
        {/* Joins the middles of the two columns (3 : 1 with a 1rem gap). */}
        <span aria-hidden className="absolute top-0 right-[calc(12.5%-0.125rem)] left-[calc(37.5%-0.375rem)] hidden h-[3px] bg-ink lg:block" />
        <section aria-label="ใช้ทุน" className="relative flex flex-col items-center gap-3">
          <span aria-hidden className="absolute -top-6 left-1/2 hidden h-6 w-[3px] -translate-x-1/2 bg-ink lg:block" />
          {node("intern")}
          <div className="grid w-full items-start gap-3 md:grid-cols-[1fr_2fr]">
            <Group label="ต้นสังกัดอื่น ๆ" className="bg-white">
              <p className="text-center text-xs text-muted">เช่น โรงเรียนแพทย์ (ภาควิชา Pre-Clinic / Clinic)</p>
              {track("fixed-medschool")}
              {track("other-hospital")}
              {track("military")}
              <Years steps={["Intern 1", "Intern 2–3 ตามข้อตกลงของต้นสังกัด หรือ Resident"]} />
            </Group>
            <Group label="สังกัดกระทรวงสาธารณสุข" className="bg-white">
              <div className="grid w-full items-start gap-3 sm:grid-cols-[2fr_1fr]">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-semibold">แพทย์พี่เลี้ยง (Fix Ward)</p>
                  {track("fixed-moph")}
                  <div className="grid w-full grid-cols-2 items-start gap-2">
                    <Years title="สอบบอร์ด" steps={["Intern 1", "Resident", "สอบบอร์ด"]} />
                    <Years title="ไม่สอบบอร์ด" steps={["Intern 1", "Intern 2–3", "Resident หรือ GP, อื่น ๆ"]} />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-semibold">ไม่ Fix Ward (จับฉลาก)</p>
                  {track("lottery")}
                  <Years steps={["Intern 1", "ได้ใบเพิ่มพูนประสบการณ์", "Intern 2–3 หรือลาออก"]} />
                </div>
              </div>
            </Group>
          </div>
        </section>
        <section aria-label="ไม่ใช้ทุน" className="relative">
          <span aria-hidden className="absolute -top-6 left-1/2 hidden h-6 w-[3px] -translate-x-1/2 bg-ink lg:block" />
          <Group label="ไม่ใช้ทุน (จ่ายค่าปรับ)" className="bg-intern">
            <p className="text-center text-sm">ทำงานโรงพยาบาลเอกชน, เรียนต่อ, เปิดคลินิก</p>
            {track("abroad")}
          </Group>
        </section>
      </div>
      <p className="mt-3 text-center text-xs text-muted">*เส้นทางอาชีพหมอไม่ตายตัว ขึ้นอยู่กับเส้นทางของแต่ละคน · ดัดแปลงจากแผนผังของ We Mahidol</p>

      <Spine />
      <p className="rounded-full border-2 border-ink bg-ink px-5 py-2 font-display font-bold text-paper">◆ เลือกเส้นทาง</p>
      <Spine />

      <div className="relative grid w-full items-start gap-8 md:grid-cols-2 md:pt-6">
        {/* From the middle of one column to the middle of the other (columns are 50% minus half the 2rem gap). */}
        <span aria-hidden data-wire="split" className="absolute top-0 right-[calc(25%-0.5rem)] left-[calc(25%-0.5rem)] hidden h-[3px] bg-ink md:block" />
        <section aria-label="Resident" className="relative flex flex-col items-center gap-3">
          <span aria-hidden data-wire="drop-resident" className="absolute -top-6 left-1/2 hidden h-6 w-[3px] -translate-x-1/2 bg-ink md:block" />
          {node("resident")}
          <Branch label={`${SPECIALTIES.length} สาขา`} defaultOpen={holds("resident")}>
            {list(SPECIALTIES, "grid grid-cols-2 gap-3")}
          </Branch>
        </section>
        <section aria-label="เส้นทางอื่น" className="relative flex flex-col items-center gap-3">
          <span aria-hidden data-wire="drop-other" className="absolute -top-6 left-1/2 hidden h-6 w-[3px] -translate-x-1/2 bg-ink md:block" />
          {node("other")}
          <Branch label={`${CAREERS.length} เส้นทาง`} defaultOpen={holds("other")}>
            {list(CAREERS, "grid grid-cols-2 gap-3")}
          </Branch>
        </section>
      </div>
    </div>
  );
}
