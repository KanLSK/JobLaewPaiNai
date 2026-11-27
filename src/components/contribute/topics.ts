import { SPECIALTIES, findStep, type Step } from "@/config/pathway";
import type { Kind } from "@/lib/entries/types";
import { NOTE_STEPS } from "@/lib/entries/validate";

/** The choices on the add-review page; the last three are all saved as notes. */
export type Topic = "elective" | "hospital" | "extern" | "resident" | "note";

const EXTERN = [findStep("extern")!];
const RESIDENT = [findStep("resident")!, ...SPECIALTIES];

export const TOPIC_STEPS: Record<"extern" | "resident" | "note", Step[]> = {
  extern: EXTERN,
  resident: RESIDENT,
  note: NOTE_STEPS.filter((s) => ![...EXTERN, ...RESIDENT].some((other) => other.id === s.id)),
};

export const kindOf = (topic: Topic): Kind => (topic === "elective" || topic === "hospital" ? topic : "note");

/** Which of the note forms holds this step. */
export const noteTopic = (stepId: string) => (["extern", "resident"] as const).find((t) => TOPIC_STEPS[t].some((s) => s.id === stepId)) ?? "note";

export const contributeHref = (topic: Topic, stepId?: string) =>
  `/contribute/${topic}${stepId && topic !== "extern" ? `?step=${encodeURIComponent(stepId)}` : ""}`;
