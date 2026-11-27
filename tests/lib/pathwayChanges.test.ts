import { NO_SERVICE, TRACKS, findStep } from "@/config/pathway";
import { NOTE_STEPS } from "@/lib/entries/validate";
import { contentFor, countByStep, stepQueries } from "@/lib/stepData";
import type { ElectiveReview, HospitalReview } from "@/lib/data/types";

test("a resident specialty borrows neither elective nor ใช้ทุน reviews, only its own notes", () => {
  const electives = [{ id: "e", specialtyId: "surgery" }] as ElectiveReview[];
  const hospitals = [{ id: "h", trackId: null, specialtyId: "surgery" }] as HospitalReview[];
  const notes = [{ id: "n", stepId: "surgery", title: "t", text: "x" }];
  expect(contentFor("surgery", electives, hospitals, notes)).toEqual({ electives: [], hospitals: [], notes });
  expect(countByStep(electives, hospitals, notes)).toMatchObject({ surgery: 1, "elective-surgery": 1, intern: 1 });
});

test("not doing service has its own paths, which take notes and no ใช้ทุน reviews", () => {
  expect(NO_SERVICE.map((s) => s.label)).toEqual(["โรงพยาบาลเอกชน", "เรียนต่อ", "เปิดคลินิก"]);
  for (const step of NO_SERVICE) {
    expect(findStep(step.id)).toMatchObject({ stage: "intern" });
    expect(NOTE_STEPS).toContainEqual(step);
    expect(TRACKS.map((t) => t.id)).not.toContain(step.id);
    expect(stepQueries(step.id)).toEqual({ note: { stepId: step.id } });
  }
});
