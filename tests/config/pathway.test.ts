import { CAREERS, SPECIALTIES, STAGES, TRACKS, findStep } from "@/config/pathway";

test("pathway matches the outline", () => {
  expect(TRACKS).toHaveLength(6);
  expect(SPECIALTIES).toHaveLength(18);
  expect(CAREERS).toHaveLength(14);
  const ids = [...STAGES, ...TRACKS, ...SPECIALTIES, ...CAREERS].map((s) => s.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(findStep("lottery")?.parentId).toBe("intern");
  expect(findStep("nonsense")).toBeNull();
});
