import { filterElectives, filterHospitals } from "@/lib/filter";
import type { ElectiveReview, HospitalReview } from "@/lib/data/types";

const e = (id: string, value: number | null, max: 5 | 10, more: Partial<ElectiveReview> = {}): ElectiveReview => ({
  id, year: "SI130", hospital: "ศิริราช", wardRaw: "ER", specialtyId: "emergency",
  overall: { label: "o", value, max }, extra: [], sections: [], threeWords: null, province: null, ...more,
});

test("score sort compares ratios with nulls last", () => {
  const out = filterElectives([e("none", null, 5), e("three", 3, 5), e("eight", 8, 10)], { sort: "score" });
  expect(out.map((x) => x.id)).toEqual(["eight", "three", "none"]);
});

test("text search covers hospital, ward and sections, ignoring case", () => {
  const list = [e("a", 1, 5, { hospital: "Ramathibodi" }), e("b", 1, 5, { wardRaw: "Med GI" }), e("c", 1, 5, { sections: [{ label: "x", text: "Very CHILL" }] })];
  for (const [text, id] of [["rama", "a"], ["med gi", "b"], ["chill", "c"]])
    expect(filterElectives(list, { text }).map((x) => x.id)).toEqual([id]);
});

test("filters combine", () => {
  const list = [e("a", 1, 5), e("b", 1, 5, { year: "SI129" }), e("c", 1, 5, { specialtyId: null })];
  expect(filterElectives(list, { year: "SI130", specialtyId: "emergency", hospital: "ศิริราช" }).map((x) => x.id)).toEqual(["a"]);
});

test("hospital filter by track, specialty and text", () => {
  const h = { id: "1", hospital: "โรงพยาบาลแพร่", summary: "คนไข้เยอะ", scores: [], trackId: "lottery", trackRaw: "", specialtyId: null, departmentRaw: "" } as HospitalReview;
  expect(filterHospitals([h], { trackId: "lottery", text: "คนไข้" })).toHaveLength(1);
  expect(filterHospitals([h], { trackId: "military" })).toHaveLength(0);
  expect(filterHospitals([h], { specialtyId: "surgery" })).toHaveLength(0);
});
