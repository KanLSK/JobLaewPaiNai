import Link from "next/link";
import { findStep, type StageId } from "@/config/pathway";
import { ElectiveCard } from "@/components/reviews/ElectiveCard";
import { HospitalCard } from "@/components/reviews/HospitalCard";
import { Empty } from "@/components/reviews/Results";
import type { ElectiveReview, HospitalReview } from "@/lib/data/types";
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

/** Only the selected step's reviews are rendered into the panel. */
export function RoadmapView({ stepId, electives, hospitals }: { stepId?: string; electives: ElectiveReview[]; hospitals: HospitalReview[] }) {
  const step = stepId ? findStep(stepId) : null;
  const content = step ? contentFor(step.id, electives, hospitals) : null;
  const signpost = step && ["graduate", "resident", "other"].includes(step.id);

  return (
    <>
      <div inert={step !== null}>
        <Roadmap counts={countByStep(electives, hospitals)} selected={step} />
      </div>
      {step && content && (
        <StepPanel key={step.id} stepId={step.id} title={step.label}>
          <p className="text-muted">{ABOUT[step.stage]}</p>
          {content.electives.length > 0 && <Link href="/electives" className="block text-sm font-semibold underline">ค้นหาและกรองรีวิว Elective ทั้งหมด</Link>}
          {content.hospitals.length > 0 && <Link href="/hospitals" className="block text-sm font-semibold underline">ค้นหาและกรองโรงพยาบาลใช้ทุน</Link>}
          {content.hospitals.map((r) => (
            <HospitalCard key={r.id} review={r} />
          ))}
          {content.electives.map((r) => (
            <ElectiveCard key={r.id} review={r} />
          ))}
          {!signpost && content.electives.length + content.hospitals.length === 0 && <Empty>รอข้อมูล</Empty>}
        </StepPanel>
      )}
    </>
  );
}
