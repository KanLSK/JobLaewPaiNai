import { parse } from "csv-parse/sync";
import { cleanTable, parseRedactions, toCsv } from "@/lib/data/clean";

const table = [
  ["Timestamp", "รหัสนักศึกษา", "review", "ข้อมูลติดต่อรพ (x)", "Rotate "],
  ["1/1", "6101999", "อ.สมมติ ใจดี\n\nถามได้ที่ line id : abc. จบ", "08", "416"],
  ["1/2", "6101998", "อ.สมมติ", "09", "417"],
];

test("drops private columns and redacts only the named row", () => {
  const out = cleanTable(table, "SI129", 1, parseRedactions("SI129-0\tสมมติ\t(ปิดชื่อ)\nSI129-0\tถามได้ที่…abc.\t\n# note\n"));
  expect(out[0]).toEqual(["review"]);
  expect(out[1]).toEqual(["อ.(ปิดชื่อ) ใจดี\n\n จบ"]);
  expect(out[2]).toEqual(["อ.สมมติ"]);
});

test("a space in the pattern matches any run of whitespace, and every occurrence goes", () => {
  const out = cleanTable([["review"], ["ก ข\nและ ก\n\nข"]], "SI130", 1, parseRedactions("SI130-0\tก ข\tX"));
  expect(out[1]).toEqual(["X\nและ X"]);
});

test("a redaction that matches nothing stops the export", () => {
  expect(() => cleanTable(table, "SI129", 1, parseRedactions("SI129-0\tไม่มีคำนี้\tX"))).toThrow("SI129-0");
});

test("csv survives quotes, commas and newlines", () => {
  const rows = [["a", 'say "hi", ok'], ["line1\nline2", ""]];
  expect(parse(toCsv(rows))).toEqual(rows);
});
