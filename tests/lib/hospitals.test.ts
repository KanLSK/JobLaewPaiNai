import { hospitalHref, reviewsForHospital } from "@/lib/hospitals";
import type { HospitalReview } from "@/lib/data/types";

const list = [
  { id: "1", hospital: "รพ. พระจอมเกล้า จ.เพชรบุรี" },
  { id: "2", hospital: "โรงพยาบาลแพร่" },
  { id: "3", hospital: "โรงพยาบาลแพร่" },
  { id: "4", hospital: "A/B 100%" },
] as HospitalReview[];

const param = (name: string) => hospitalHref(name).replace("/hospitals/", "");

test("names round-trip, encoded or already decoded", () => {
  for (const { hospital } of list) {
    expect(reviewsForHospital(param(hospital), list)?.name).toBe(hospital);
    expect(reviewsForHospital(hospital, list)?.name).toBe(hospital);
  }
  expect(param("A/B 100%")).not.toContain("/");
});

test("rows of one hospital come together", () => {
  expect(reviewsForHospital(param("โรงพยาบาลแพร่"), list)?.reviews.map((r) => r.id)).toEqual(["2", "3"]);
});

test("unknown or malformed names give null", () => {
  expect(reviewsForHospital("nope", list)).toBeNull();
  expect(reviewsForHospital("%E0%", list)).toBeNull();
});
