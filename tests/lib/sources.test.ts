import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { csvSource } from "@/lib/data/csvSource";
import { sheetsSource } from "@/lib/data/sheetsSource";
import { MissingColumnError, columnLetter } from "@/lib/data/columns";
import type { TableId } from "@/lib/data/types";

function csvWith(table: TableId, text: string) {
  const file = path.join(mkdtempSync(path.join(tmpdir(), "jl-")), `${table}.csv`);
  writeFileSync(file, text);
  return csvSource({ si129: file, si130: file, hospitals: file, aliases: file });
}

const sample = '﻿Rotate  ,รหัสนักศึกษา,วอร์ด,วอร์ด\n416,6101999,first,"line1\nline2"\n';

test("reads requested columns only, handling repeats, spaces, BOM and multiline cells", async () => {
  const rows = await csvWith("si129", sample).readTable("si129", [
    { key: "rotate", header: "Rotate" },
    { key: "ward2", header: "วอร์ด", occurrence: 2 },
    { key: "approved", header: "approved", optional: true },
  ]);
  expect(rows).toEqual([{ rotate: "416", ward2: "line1\nline2", approved: "" }]);
  expect(JSON.stringify(rows)).not.toContain("6101999");
});

test("a renamed column names itself in the error", async () => {
  const read = csvWith("si129", sample).readTable("si129", [{ key: "h", header: "ชื่อโรงพยาบาล" }]);
  await expect(read).rejects.toThrow(MissingColumnError);
  await expect(read).rejects.toThrow("ชื่อโรงพยาบาล");
});

test("resolves the two-row hospital header", async () => {
  const text = [
    "title,,,",
    ",,note,",
    "โรงพยาบาลใช้ทุน (ข้อมูลเท่าที่ทราบ),รีวิวเพิ่มเติม,,approved",
    ",ความหลากหลาย,โอกาส,",
    "รพ ก,4,5,yes",
  ].join("\n");
  const rows = await csvWith("hospitals", text).readTable("hospitals", [
    { key: "name", header: "โรงพยาบาลใช้ทุน (ข้อมูลเท่าที่ทราบ)" },
    { key: "s2", header: "โอกาส" },
    { key: "approved", header: "approved", optional: true },
  ]);
  expect(rows).toEqual([{ name: "รพ ก", s2: "5", approved: "yes" }]);
});

test("column letters go past Z", () => {
  expect([0, 25, 26, 27, 701, 702].map(columnLetter)).toEqual(["A", "Z", "AA", "AB", "ZZ", "AAA"]);
});

const tabs = { si129: "SI129", si130: "SI130", hospitals: "hospitals", aliases: "aliases" };

test("sheets source requests only header rows and wanted columns", async () => {
  const requested: string[] = [];
  const fakeFetch = (async (url: string | URL) => {
    const ranges = new URL(url).searchParams.getAll("ranges");
    requested.push(...ranges);
    const body = ranges[0].endsWith("!1:1")
      ? { valueRanges: [{ values: [["name", "รหัสนักศึกษา", "ward", "approved"]] }] }
      : { valueRanges: [{ values: [["a", "b"]] }, { values: [["w1"]] }] };
    return new Response(JSON.stringify(body));
  }) as typeof fetch;

  const rows = await sheetsSource({ sheetId: "S", tabs, getToken: async () => "t", fetchImpl: fakeFetch }).readTable("si129", [
    { key: "name", header: "name" },
    { key: "ward", header: "ward" },
  ]);

  expect(requested).toEqual(["'SI129'!1:1", "'SI129'!A2:A", "'SI129'!C2:C"]);
  expect(rows).toEqual([{ name: "a", ward: "w1" }, { name: "b", ward: "" }]);
});

test("sheets source fails on a non-200 answer", async () => {
  const source = sheetsSource({ sheetId: "S", tabs, getToken: async () => "t", fetchImpl: (async () => new Response("no", { status: 403 })) as typeof fetch });
  await expect(source.readTable("si130", [{ key: "a", header: "a" }])).rejects.toThrow("403");
});
