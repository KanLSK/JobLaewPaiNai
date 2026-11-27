import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { buildAliases } from "@/lib/data/aliases";
import { isApproved, parseHospitals, parseScore, parseSI129, parseSI130 } from "@/lib/data/parse";
import { SPECIALTIES, TRACKS } from "@/config/pathway";

const aliasRows = parse(readFileSync("config/aliases.csv", "utf8"), { columns: true, bom: true }) as Record<string, string>[];
const aliases = buildAliases(aliasRows);

test("approval is exactly yes", () => {
  for (const v of ["yes", " YES "]) expect(isApproved(v)).toBe(true);
  for (const v of ["", "no", "y", "yes?"]) expect(isApproved(v)).toBe(false);
});

test("bad scores become null", () => {
  for (const v of ["", "-", "abc", "0", "6"]) expect(parseScore(v, "x", 5).value).toBeNull();
  expect(parseScore(" 3 ", "x", 5)).toEqual({ label: "x", value: 3, max: 5 });
});

test("unapproved rows are dropped by every parser", () => {
  const row = { approved: "", place: "ศิริราช", hospital: "x", name: "x" };
  expect(parseSI129([row], aliases)).toEqual([]);
  expect(parseSI130([row], aliases)).toEqual([]);
  expect(parseHospitals([row], aliases)).toEqual([]);
});

test("both SI129 layouts give the same shape", () => {
  const [inside, outside] = parseSI129(
    [
      { approved: "yes", place: "ศิริราช", ward: "Med cardio", content: "ดี", overall: "8" },
      { approved: "yes", place: "รพ.ข้างนอก", outName: "สระบุรี", outProvince: "สระบุรี", outWard: "ER", outContent: "สนุก", outOverall: "9", ward: "ignored" },
    ],
    aliases,
  );
  expect(Object.keys(inside).sort()).toEqual(Object.keys(outside).sort());
  expect(inside).toMatchObject({ hospital: "ศิริราช", wardRaw: "Med cardio", specialtyId: "internal-medicine", province: null });
  expect(inside.overall).toMatchObject({ value: 8, max: 10 });
  expect(outside).toMatchObject({ hospital: "โรงพยาบาลสระบุรี", wardRaw: "ER", specialtyId: "emergency", province: "สระบุรี" });
  expect(outside.overall).toMatchObject({ value: 9, max: 10 });
});

test("aliases normalise spellings and leave unknown wards unmapped", () => {
  const [a, b] = parseSI130(
    [
      { approved: "yes", hospital: "Siriraj ", ward: "Nutrition", review: "ok" },
      { approved: "yes", hospital: "-", ward: "med  CARDIO", review: "-" },
    ],
    aliases,
  );
  expect(a).toMatchObject({ hospital: "ศิริราช", specialtyId: null, wardRaw: "Nutrition" });
  expect(b).toMatchObject({ hospital: "ไม่ระบุโรงพยาบาล", specialtyId: "internal-medicine", sections: [] });
});

test("hospital rows map track and department, and skip nameless rows", () => {
  const rows = parseHospitals(
    [
      { approved: "yes", name: "รพ แพร่", track: "Fixed สอบบอร์ด", department: "Ortho", s0: "4", summary: "-" },
      { approved: "yes", name: "", track: "x" },
    ],
    aliases,
  );
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ hospital: "โรงพยาบาลแพร่", trackId: "fixed-moph", trackRaw: "Fixed สอบบอร์ด", specialtyId: "orthopedics", summary: null });
  expect(rows[0].scores).toHaveLength(10);
});

test("keys that were never asked for do not surface", () => {
  const out = parseSI130([{ approved: "yes", hospital: "x", studentId: "6101999", timestamp: "7/12/2022" }], aliases);
  expect(JSON.stringify(out)).not.toMatch(/6101999|2022/);
});

test("every alias target is a pathway label", () => {
  const valid = { department: SPECIALTIES.map((s) => s.label), track: TRACKS.map((s) => s.label) };
  for (const row of aliasRows) {
    expect(["hospital", "department", "track"]).toContain(row.kind);
    if (row.kind !== "hospital") expect(valid[row.kind as "department" | "track"]).toContain(row.to);
  }
});
