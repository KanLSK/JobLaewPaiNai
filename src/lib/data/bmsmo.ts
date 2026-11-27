import { parse } from "csv-parse/sync";
import type { Aliases } from "./aliases";
import { parseBMSMO } from "./parse";
import type { ElectiveReview } from "./types";

export const BMSMO_FILE = "Elective Review BMSMO64.csv";

const COLUMNS = {
  hospital: "โรงพยาบาล",
  department: "สาขา",
  place: "สถานที่",
  comment: "Comment",
  overall: "คะแนนภาพรวม",
  other: "อื่น ๆ (อาหาร/สถานที่ท่องเที่ยว/อากาศ)",
};

/** The combined sheet of the BMSMO64 workbook, saved as CSV. */
export function parseBMSMOFile(csv: string, aliases: Aliases): ElectiveReview[] {
  const [header = [], ...lines]: string[][] = parse(csv, { bom: true });
  const columns = Object.entries(COLUMNS).map(([key, name]) => {
    const index = header.indexOf(name);
    if (index < 0) throw new Error(`${BMSMO_FILE} has no column named "${name}"`);
    return [key, index] as const;
  });
  return parseBMSMO(lines.map((line) => Object.fromEntries(columns.map(([key, i]) => [key, line[i] ?? ""]))), aliases);
}
