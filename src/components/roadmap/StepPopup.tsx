import Link from "next/link";
import { guideHref, type SectionId } from "@/components/guide/topics";
import { contributeHref, noteTopic } from "@/components/contribute/topics";
import type { Step } from "@/config/pathway";
import { ElectiveCards } from "@/components/reviews/ElectiveCards";
import { HospitalCard } from "@/components/reviews/HospitalCard";
import { Empty } from "@/components/reviews/Results";
import { Card } from "@/components/ui/Card";
import type { StepContent } from "@/lib/stepData";
import { StepPanel } from "./StepPanel";
import type { StageId } from "@/config/pathway";

const ABOUT: Record<StageId, string> = {
  elective: "วิชาเลือกก่อนจบ ดูว่ารุ่นพี่ไปที่ไหน วอร์ดอะไรมาบ้าง",
  extern: "ปีสุดท้ายก่อนจบเป็นแพทย์",
  graduate: "จบแล้ว! จุดเริ่มต้นของทุกเส้นทาง",
  intern: "ช่วงใช้ทุนหลังเรียนจบ เลือก track ที่สนใจ",
  resident: "เรียนต่อแพทย์เฉพาะทาง เลือกภาควิชาที่สนใจ",
  other: "เส้นทางอื่นของคนจบแพทย์",
};

/** Steps that have a matching section on the guide page. */
const GUIDE: Record<string, SectionId> = {
  graduate: "register",
  intern: "register",
  lottery: "register",
  "fixed-moph": "fixward",
  "fixed-medschool": "timeline",
  military: "timeline",
  resident: "eligibility",
};

/** The form that fits a step, with the step already chosen where the form asks for it. */
function formFor(step: Step) {
  if (step.stage === "elective") return contributeHref("elective");
  if (step.parentId === "intern") return contributeHref("hospital", step.id);
  if (step.id === "intern") return contributeHref("hospital");
  return contributeHref(noteTopic(step.id), step.id);
}

/** What one step holds, over the page it was opened from. */
export function StepPopup({ step, content, canContribute = false, base = "/" }: { step: Step; content: StepContent; canContribute?: boolean; base?: string }) {
  const total = content.electives.length + content.hospitals.length + content.notes.length;
  const signpost = ["graduate", "resident", "other"].includes(step.id);

  return (
      <StepPanel key={step.id} stepId={step.id} base={base} title={step.parentId === "elective" ? `Elective · ${step.label}` : step.label}>
        <p className="text-muted">{ABOUT[step.stage]}</p>
        {GUIDE[step.id] && <Link href={guideHref(GUIDE[step.id])} className="block text-sm font-semibold underline">อ่านในคู่มือ</Link>}
        {content.electives.length > 0 && <Link href="/electives" className="block text-sm font-semibold underline">ค้นหาและกรองรีวิว Elective ทั้งหมด</Link>}
        {content.hospitals.length > 0 && <Link href="/hospitals" className="block text-sm font-semibold underline">ค้นหาและกรองโรงพยาบาลใช้ทุน</Link>}
        {content.electives.length + content.hospitals.length > 0 && (
          // One grid, so hospital and elective cards come out the same size.
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
            {content.hospitals.map((r) => (
              <HospitalCard key={r.id} review={r} />
            ))}
            <ElectiveCards reviews={content.electives} closeAllHref={base} />
          </div>
        )}
        {content.notes.map((note) => (
          <Card key={note.id} stage={step.stage} header={<h3 className="font-bold break-words">{note.title}</h3>}>
            <p className="text-sm leading-relaxed break-words whitespace-pre-line">{note.text}</p>
          </Card>
        ))}
        {!signpost && total === 0 && <Empty>รอข้อมูล</Empty>}
        {canContribute && total === 0 && <Link href={formFor(step)} className="block text-sm font-semibold underline">เพิ่มข้อมูลของคุณ</Link>}
      </StepPanel>
  );
}
