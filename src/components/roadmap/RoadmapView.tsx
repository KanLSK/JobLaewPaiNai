import Link from "next/link";
import { findStep, type StageId, type Step } from "@/config/pathway";
import { ElectiveCards } from "@/components/reviews/ElectiveCards";
import { HospitalCard } from "@/components/reviews/HospitalCard";
import { Empty } from "@/components/reviews/Results";
import { Card } from "@/components/ui/Card";
import type { ElectiveReview, HospitalReview, NoteEntry } from "@/lib/data/types";
import { contentFor, countByStep } from "@/lib/stepData";
import { Roadmap } from "./Roadmap";
import { StepPanel } from "./StepPanel";

const ABOUT: Record<StageId, string> = {
  elective: "วิชาเลือกก่อนจบ ดูว่ารุ่นพี่ไปที่ไหน วอร์ดอะไรมาบ้าง",
  extern: "ปีสุดท้ายก่อนจบเป็นแพทย์",
  graduate: "จบแล้ว! จุดเริ่มต้นของทุกเส้นทาง",
  intern: "ช่วงใช้ทุนหลังเรียนจบ เลือก track ที่สนใจ",
  resident: "เรียนต่อแพทย์เฉพาะทาง เลือกภาควิชาที่สนใจ",
  other: "เส้นทางอื่นของคนจบแพทย์",
};

/** Steps that have a matching section on the guide page. */
const GUIDE: Record<string, string> = {
  graduate: "register",
  intern: "register",
  lottery: "register",
  "fixed-moph": "fixward",
  "fixed-medschool": "timeline",
  military: "timeline",
  resident: "eligibility",
};

/** The form that fits a step, with the step already chosen where the form asks for it. */
function contributeHref(step: Step) {
  if (step.stage === "elective") return "/contribute/elective";
  if (step.parentId === "intern") return `/contribute/hospital?step=${step.id}`;
  if (step.id === "intern") return "/contribute/hospital";
  return `/contribute/note?step=${step.id}`;
}

interface Props {
  stepId?: string;
  /** Counted from the lists below when not given. */
  counts?: Record<string, number>;
  electives: ElectiveReview[];
  hospitals: HospitalReview[];
  notes?: NoteEntry[];
  canContribute?: boolean;
}

/** Only the selected step's reviews are rendered into the panel. */
export function RoadmapView({ stepId, counts, electives, hospitals, notes = [], canContribute = false }: Props) {
  const step = stepId ? findStep(stepId) : null;
  const content = step ? contentFor(step.id, electives, hospitals, notes) : null;
  const total = content ? content.electives.length + content.hospitals.length + content.notes.length : 0;
  const signpost = step && ["graduate", "resident", "other"].includes(step.id);

  return (
    <>
      <div inert={step !== null}>
        <Roadmap counts={counts ?? countByStep(electives, hospitals, notes)} selected={step} />
      </div>
      {step && content && (
        <StepPanel key={step.id} stepId={step.id} title={step.parentId === "elective" ? `Elective · ${step.label}` : step.label}>
          <p className="text-muted">{ABOUT[step.stage]}</p>
          {GUIDE[step.id] && <Link href={`/guide#${GUIDE[step.id]}`} className="block text-sm font-semibold underline">อ่านในคู่มือ</Link>}
          {content.electives.length > 0 && <Link href="/electives" className="block text-sm font-semibold underline">ค้นหาและกรองรีวิว Elective ทั้งหมด</Link>}
          {content.hospitals.length > 0 && <Link href="/hospitals" className="block text-sm font-semibold underline">ค้นหาและกรองโรงพยาบาลใช้ทุน</Link>}
          {content.electives.length + content.hospitals.length > 0 && (
            // One grid, so hospital and elective cards come out the same size.
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
              {content.hospitals.map((r) => (
                <HospitalCard key={r.id} review={r} />
              ))}
              <ElectiveCards reviews={content.electives} closeAllHref="/" />
            </div>
          )}
          {content.notes.map((note) => (
            <Card key={note.id} stage={step.stage} header={<h3 className="font-bold break-words">{note.title}</h3>}>
              <p className="text-sm leading-relaxed break-words whitespace-pre-line">{note.text}</p>
            </Card>
          ))}
          {!signpost && total === 0 && <Empty>รอข้อมูล</Empty>}
          {canContribute && total === 0 && <Link href={contributeHref(step)} className="block text-sm font-semibold underline">เพิ่มข้อมูลของคุณ</Link>}
        </StepPanel>
      )}
    </>
  );
}
