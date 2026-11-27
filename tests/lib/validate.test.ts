import { buildAliases } from "@/lib/data/aliases";
import { validate } from "@/lib/entries/validate";

const aliases = buildAliases([{ kind: "hospital", from: "siriraj", to: "ศิริราช" }]);
const good = { year: "SI131", hospital: " siriraj ", department: "surgery", ward: "CVT", overall: "5", learned: "4", chill: "", review: "ดีมาก", advice: "", consent: "on" };

test("an elective is shaped like an imported one", () => {
  const r = validate("elective", { ...good, status: "approved", id: "x", source: "import" }, aliases);
  expect(r).toMatchObject({ ok: true, data: { year: "SI131", hospital: "ศิริราช", specialtyId: "surgery", wardRaw: "CVT", overall: { value: 5, max: 5 }, province: null, threeWords: null } });
  const data = (r as { data: object }).data;
  for (const key of ["status", "id", "source", "consent"]) expect(Object.keys(data)).not.toContain(key);
});

test.each([["year", "131"], ["hospital", "   "], ["overall", "6"], ["learned", "x"], ["review", " "], ["review", "ก".repeat(5001)], ["department", "nope"], ["consent", ""]])(
  "rejects %s = %s",
  (field, value) => {
    expect(validate("elective", { ...good, [field]: value }, aliases)).toMatchObject({ ok: false, errors: { [field]: expect.any(String) } });
  },
);

test("hospital needs a known track and the overall score only", () => {
  const form = { hospital: "รพ.แพร่", track: "lottery", department: "", summary: "", s9: "4", consent: "on" };
  expect(validate("hospital", form, aliases)).toMatchObject({ ok: true, data: { trackId: "lottery", departmentRaw: "", specialtyId: null, summary: null } });
  expect(validate("hospital", { ...form, track: "x" }, aliases).ok).toBe(false);
  expect(validate("hospital", { ...form, s9: "" }, aliases).ok).toBe(false);
});

test("a note needs an allowed step", () => {
  const form = { step: "extern", title: "t", text: "x", consent: "on" };
  expect(validate("note", form, aliases)).toMatchObject({ ok: true, data: { stepId: "extern" } });
  expect(validate("note", { ...form, step: "elective" }, aliases).ok).toBe(false);
});
