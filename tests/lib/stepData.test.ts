import { contentFor, countByStep } from "@/lib/stepData";
import type { ElectiveReview, HospitalReview } from "@/lib/data/types";

const electives = [{ id: "e1", specialtyId: "surgery" }, { id: "e2", specialtyId: null }] as ElectiveReview[];
const hospitals = [{ id: "h1", trackId: "lottery", specialtyId: "surgery" }, { id: "h2", trackId: null, specialtyId: null }] as HospitalReview[];
const ids = (step: string) => {
  const c = contentFor(step, electives, hospitals);
  return [c.electives.map((x) => x.id), c.hospitals.map((x) => x.id)];
};

test("each step gets its own reviews", () => {
  expect(ids("elective")).toEqual([["e1", "e2"], []]);
  expect(ids("intern")).toEqual([[], ["h1", "h2"]]);
  expect(ids("lottery")).toEqual([[], ["h1"]]);
  expect(ids("surgery")).toEqual([[], []]);
  for (const empty of ["extern", "graduate", "resident", "other", "research", "military", "nonsense"])
    expect(ids(empty)).toEqual([[], []]);
});

test("counts per step", () => {
  const counts = countByStep(electives, hospitals);
  expect(counts).toMatchObject({ elective: 2, intern: 2, lottery: 1, surgery: 0, extern: 0, research: 0 });
});

test("a note belongs to its step and is counted there", () => {
  const notes = [{ id: "n", stepId: "extern", title: "t", text: "x" }];
  expect(countByStep([], [], notes).extern).toBe(1);
  expect(contentFor("extern", [], [], notes).notes).toEqual(notes);
  expect(contentFor("lottery", [], [], notes).notes).toEqual([]);
});
