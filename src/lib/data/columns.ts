import type { ColumnSpec, TableId } from "./types";

export const HOSPITAL_ANCHOR = "โรงพยาบาลใช้ทุน";

export class MissingColumnError extends Error {
  constructor(public table: TableId, public header: string) {
    super(`Table "${table}" has no column named "${header}"`);
    this.name = "MissingColumnError";
  }
}

export const normaliseHeader = (value: string) => value.replace(/\s+/g, " ").trim();

/** How many rows must be read to see the headers. Form tabs stop at 1 so no response is fetched. */
export const headerRowCount = (table: TableId) => (table === "hospitals" ? 5 : 1);

export function resolveColumns(
  headerRows: string[][],
  columns: ColumnSpec[],
  table: TableId,
): { indexes: Record<string, number>; dataStart: number } {
  let dataStart = 1;
  if (table === "hospitals") {
    const anchor = headerRows.findIndex((row) => row.some((c) => normaliseHeader(c).startsWith(HOSPITAL_ANCHOR)));
    if (anchor < 0) throw new MissingColumnError(table, HOSPITAL_ANCHOR);
    dataStart = anchor + 2; // the header row and the score sub-headers under it
  }
  const header = headerRows.slice(0, dataStart).map((row) => row.map(normaliseHeader));
  const width = Math.max(0, ...header.map((row) => row.length));

  const indexes: Record<string, number> = {};
  for (const column of columns) {
    const wanted = normaliseHeader(column.header);
    const matches = [];
    for (let i = 0; i < width; i++) if (header.some((row) => row[i] === wanted)) matches.push(i);
    const index = matches[(column.occurrence ?? 1) - 1];
    if (index !== undefined) indexes[column.key] = index;
    else if (!column.optional) throw new MissingColumnError(table, column.header);
  }
  return { indexes, dataStart };
}

export function columnLetter(index: number): string {
  let letters = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters;
  }
  return letters;
}

const approved: ColumnSpec = { key: "approved", header: "approved", optional: true };
const col = (key: string, header: string, occurrence?: number): ColumnSpec => ({ key, header, occurrence });

// Allow-lists. Timestamp, rotation code, student ID and hospital contacts must never appear here.
export const SI129_COLUMNS: ColumnSpec[] = [
  col("place", "สถานที่ไป elective"),
  col("ward", "วอร์ดที่เลือก", 1),
  col("content", "รีวิวเนื้อหา /สิ่งที่ได้จากวอร์ด/ความว่างหรือเอ้ดมากๆ"),
  col("seniors", "รีวิวพี่เด้น"),
  col("teachers", "รีวิวอาจารย์"),
  col("overall", "คะแนนภาพรวม", 1),
  col("other", "อื่นๆ"),
  col("outName", "ชื่อรพ"),
  col("outProvince", "จังหวัด"),
  col("outWard", "วอร์ดที่เลือก", 2),
  col("outContent", "รีวิวเนื้อหา /สิ่งที่ได้จากวอร์ด /ความว่างหรือเอ้ดมากๆ"),
  col("outStaff", "รีวิวสตาฟ"),
  col("outTravel", "รีวิวที่เที่ยว"),
  col("outOverall", "คะแนนภาพรวม", 2),
  col("outOther", "อื่นๆ ( ex ห้องพัก, ร้านอาหาร, มีร้านซักผ้าไหม)"),
  col("recommend", "ควรไป elective ที่นี้ไหม"),
  col("threeWords", "ขอ 3 คำ ให้กับ elective ที่ไปมา"),
  approved,
];

export const SI130_COLUMNS: ColumnSpec[] = [
  col("hospital", "ชื่อโรงพยาบาลที่ไป"),
  col("ward", "วอร์ดที่เลือก"),
  col("overall", "ความพึงพอใจในภาพรวม"),
  col("learned", "ได้ความรู้หรือประสบการณ์ใหม่ๆมากเเค่ไหน"),
  col("chill", "ความชิล"),
  col("review", "รีวิวElective"),
  col("advice", "ฝากถึงน้องๆที่จะมาElectiveที่นี่"),
  approved,
];

export const HOSPITAL_SCORE_HEADERS = [
  "ความหลากหลายและปริมาณผู้ป่วย",
  "โอกาสในการเรียนรู้และพัฒนาทักษะ",
  "คุณภาพและการเข้าถึงอาจารย์/แพทย์พี่เลี้ยง",
  "ระบบการทำงานและการแบ่งหน้าที่",
  "สมดุลระหว่างงานและชีวิตส่วนตัว (Work–Life Balance)",
  "บรรยากาศและความสัมพันธ์ในที่ทำงาน",
  "ระบบสนับสนุนและสวัสดิการสำหรับแพทย์ใช้ทุน",
  "สิ่งแวดล้อมและทรัพยากรของโรงพยาบาล",
  "รายได้/ความคุ้มค่าเมื่อเทียบกับภาระงาน",
  "ความพึงพอใจโดยรวมต่อการใช้ทุน",
];

export const HOSPITAL_COLUMNS: ColumnSpec[] = [
  col("name", "โรงพยาบาลใช้ทุน (ข้อมูลเท่าที่ทราบ)"),
  col("summary", 'รีวิวภาพรวม (เช่น ข้อดี-ข้อเสีย สิ่งที่ประทับใจ-สิ่งที่ไม่ประทับใจ) และข้อคิดเห็นเพิ่มเติม ไม่มีข้อมูลใส่ "-"'),
  ...HOSPITAL_SCORE_HEADERS.map((header, i) => col(`s${i}`, header)),
  col("track", "Pathway/Track ที่มีให้เลือกใช้ทุน"),
  col("department", "ภาควิชา/สาขาวิชาที่มีให้เลือกใช้ทุน"),
  approved,
];

export const ALIAS_COLUMNS: ColumnSpec[] = [col("kind", "kind"), col("from", "from"), col("to", "to")];
