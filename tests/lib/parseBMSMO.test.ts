import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { buildAliases } from "@/lib/data/aliases";
import { parseBMSMOFile } from "@/lib/data/bmsmo";
import { parseBMSMO } from "@/lib/data/parse";

const aliases = buildAliases(parse(readFileSync("config/aliases.csv", "utf8"), { columns: true, bom: true }) as Record<string, string>[]);
const one = (row: Record<string, string>) => parseBMSMO([row], aliases)[0];
const sections = (row: Record<string, string>) => one(row).sections.map((s) => [s.label, s.text]);

test("a row becomes an approved-shape elective review", () => {
  const review = one({ hospital: "โรงพยาบาลศิริราช", department: "Medicine", place: "หน่วยทดสอบ", overall: "9/10" });
  expect(review).toEqual({
    id: "BM64-0",
    year: "BMSMO64",
    hospital: "ศิริราช",
    wardRaw: "หน่วยทดสอบ",
    specialtyId: "internal-medicine",
    overall: { label: "คะแนนภาพรวม", value: 9, max: 10 },
    extra: [],
    sections: [],
    threeWords: null,
    province: null,
  });
});

test("scores are out of 10; blank or impossible ones are left empty", () => {
  expect(one({ overall: "7" }).overall.value).toBe(7);
  expect(one({ overall: "10/10" }).overall.value).toBe(10);
  for (const overall of ["", "69/10"]) expect(one({ overall }).overall.value).toBeNull();
});

test("every department in the file has a place on the map, except Others", () => {
  const names = ["Medicine", "Surgery", "Pediatrics", "Orthopedics", "ENT", "Psychiatry", "Rehabilitation medicine", "Family medicine", "Pathology", "OBGYN", "Ophthalmology", "Forensic", "Occupational medicine", "Anesthesiology", "Radiology", "ER"];
  for (const department of names) expect([department, one({ department }).specialtyId]).not.toEqual([department, null]);
  expect(one({ department: "Others" }).specialtyId).toBeNull();
});

test("hospital names join the ones already on the site", () => {
  expect(one({ hospital: "โรงพยาบาลศรีนครินทร์" }).hospital).toBe("โรงพยาบาลศรีนครินทร์ ขอนแก่น");
  expect(one({ hospital: "ไม่ระบุ" }).hospital).toBe("ไม่ระบุโรงพยาบาล");
});

test("the comment is split at its headings, keeping every line and skipping blanks", () => {
  const comment = "ที่พักและการเดินทาง:\nหอ\n\nActivity ในแต่ละวัน:\n8.00 ราวน์\n9.00 OPD: ตึก 1\n\nสรุปข้อดี:\n-\n\nสิ่งที่ได้รับ: ความรู้";
  expect(sections({ comment })).toEqual([
    ["ที่พักและการเดินทาง", "หอ"],
    ["Activity ในแต่ละวัน", "8.00 ราวน์\n9.00 OPD: ตึก 1"],
    ["สิ่งที่ได้รับ", "ความรู้"],
  ]);
});

test("the wrapped left-column label is taken out of the food and travel text", () => {
  const other = "อาหาร, สถานที่        ข้าวฟรี\nท่องเที่ยว ,          อากาศไม่ดี\nอากาศ (เรื่อง\nอืน่ ๆ ที่ไม่ใช่เรื่อง   ร้อน\nเรียน)\nกินเยอะ";
  expect(sections({ other })).toEqual([["อาหาร ที่เที่ยว อากาศ", "ข้าวฟรี\nอากาศไม่ดี\nร้อน\nกินเยอะ"]]);
});

test("the three-part layout becomes three sections", () => {
  const other = "รีวิวอาหาร        ตลาด\nอร่อย\nรีวิวสถานที่      ถ้ำ\nท่องเที่ยว        น้ำตก\nรีวิวสภาพ\nอากาศ/            เย็น\nสภาพแวดล้อม      ฝนตก";
  expect(sections({ other })).toEqual([
    ["อาหาร", "ตลาด\nอร่อย"],
    ["สถานที่ท่องเที่ยว", "ถ้ำ\nน้ำตก"],
    ["สภาพอากาศ/สภาพแวดล้อม", "เย็น\nฝนตก"],
  ]);
});

test("a blank answer leaves no section, and unlabelled text is kept as it is", () => {
  expect(sections({ other: "อาหาร, สถานที่ท่องเที่ยว ,   -\nอากาศ (เรื่องอื่นๆ ที่ไม่ใช่เรื่อง\nเรียน)" })).toEqual([]);
  expect(sections({ other: "เขียนไปแล้ว" })).toEqual([["อาหาร ที่เที่ยว อากาศ", "เขียนไปแล้ว"]]);
});

test("a label the booklet cut short is fine, but label text left inside an answer stops the import", () => {
  expect(sections({ other: "อาหาร, สถานที่   อร่อย\nท่องเที่ยว ,      ศัลย์" })).toEqual([["อาหาร ที่เที่ยว อากาศ", "อร่อย\nศัลย์"]]);
  expect(() => one({ other: "อาหาร, สถานที่ ข้าว\nกิน (เรื่องอื่นๆ ที่ไม่ใช่เรื่อง" })).toThrow(/BM64-0/);
});

test("the booklet's spreadsheet is read by its Thai column names, and a missing one stops the import", () => {
  const header = '"โรงพยาบาล","สาขา","สถานที่","Comment","คะแนนภาพรวม","อื่น ๆ (อาหาร/สถานที่ท่องเที่ยว/อากาศ)","หน้า PDF"';
  const [review] = parseBMSMOFile(`﻿${header}\n"โรงพยาบาลลำปาง","ER","ห้องฉุกเฉิน","สรุปข้อดี:\nดี","8","เขียนไปแล้ว","12"\n`, aliases);
  expect(review).toMatchObject({ hospital: "โรงพยาบาลลำปาง", specialtyId: "emergency", wardRaw: "ห้องฉุกเฉิน" });
  expect(review.sections.map((s) => s.text)).toEqual(["ดี", "เขียนไปแล้ว"]);
  expect(() => parseBMSMOFile('"โรงพยาบาล"\n"x"\n', aliases)).toThrow(/สาขา/);
});
