import { findStep } from "@/config/pathway";
import type { ElectiveReview, HospitalReview, NoteEntry } from "@/lib/data/types";
import { contentFor, countByStep } from "@/lib/stepData";
import { Roadmap } from "./Roadmap";
import { StepPopup } from "./StepPopup";

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

  return (
    <>
      <div inert={step !== null}>
        <Roadmap counts={counts ?? countByStep(electives, hospitals, notes)} selected={step} />
      </div>
      {step && <StepPopup step={step} content={contentFor(step.id, electives, hospitals, notes)} canContribute={canContribute} />}
    </>
  );
}
