import { ELECTIVE_DEPARTMENTS, SPECIALTIES, findStep } from "@/config/pathway";
import { contentFor, countByStep } from "@/lib/stepData";
import type { ElectiveReview } from "@/lib/data/types";

const electives = [{ id: "a", specialtyId: "internal-medicine" }, { id: "b", specialtyId: "surgery" }, { id: "c", specialtyId: null }] as ElectiveReview[];

test("there is a branch per department plus one for the rest", () => {
  expect(ELECTIVE_DEPARTMENTS).toHaveLength(SPECIALTIES.length + 1);
  expect(findStep("elective-surgery")).toMatchObject({ label: "ศัลยศาสตร์", stage: "elective", parentId: "elective" });
  expect(findStep("elective-other")?.label).toBe("อื่นๆ");
});

test("each branch holds only its department's elective reviews", () => {
  const ids = (step: string) => contentFor(step, electives, []).electives.map((e) => e.id);
  expect(ids("elective-internal-medicine")).toEqual(["a"]);
  expect(ids("elective-surgery")).toEqual(["b"]);
  expect(ids("elective-other")).toEqual(["c"]);
  expect(ids("elective")).toEqual(["a", "b", "c"]);
  expect(countByStep(electives, [])).toMatchObject({ "elective-surgery": 1, "elective-other": 1, "elective-ent": 0 });
});
