import { SPECIALTIES, TRACKS, type Step } from "@/config/pathway";
import { aliasKey, canonical, type AliasKind, type Aliases } from "./aliases";
import { HOSPITAL_SCORE_HEADERS } from "./columns";
import type { ElectiveReview, HospitalReview, Row, Score } from "./types";

const UNKNOWN_HOSPITAL = "ไม่ระบุโรงพยาบาล";

export const isApproved = (value: string) => value.trim().toLowerCase() === "yes";

export function parseScore(value: string, label: string, max: 5 | 10): Score {
  const n = Number(value.trim());
  return { label, value: Number.isFinite(n) && n >= 1 && n <= max ? n : null, max };
}

/** Trimmed text; empty cells and "-" mean no answer. */
const text = (value: string | undefined) => {
  const t = (value ?? "").trim();
  return t === "" || t === "-" ? null : t;
};

const sections = (entries: [string, string | undefined][]) =>
  entries.flatMap(([label, value]) => {
    const t = text(value);
    return t ? [{ label, text: t }] : [];
  });

function stepId(aliases: Aliases, kind: AliasKind, value: string, steps: Step[]): string | null {
  const label = aliasKey(canonical(aliases, kind, value));
  return steps.find((s) => aliasKey(s.label) === label)?.id ?? null;
}

const hospitalName = (aliases: Aliases, value: string | undefined) => {
  const raw = text(value);
  return raw ? canonical(aliases, "hospital", raw) : UNKNOWN_HOSPITAL;
};

/** Ids use the row position, so approving one row does not renumber the others. */
function approvedRows(rows: Row[]) {
  return rows.map((row, index) => ({ row, index })).filter(({ row }) => isApproved(row.approved ?? ""));
}

export function parseSI129(rows: Row[], aliases: Aliases): ElectiveReview[] {
  return approvedRows(rows).map(({ row, index }) => {
    const outside = (row.place ?? "").trim() === "รพ.ข้างนอก";
    const wardRaw = text(outside ? row.outWard : row.ward) ?? "";
    return {
      id: `SI129-${index}`,
      year: "SI129",
      hospital: hospitalName(aliases, outside ? row.outName : row.place),
      wardRaw,
      specialtyId: stepId(aliases, "department", wardRaw, SPECIALTIES),
      overall: parseScore((outside ? row.outOverall : row.overall) ?? "", "คะแนนภาพรวม", 10),
      extra: [parseScore(row.recommend ?? "", "ควรไป", 5)],
      sections: sections(
        outside
          ? [["เนื้อหา / สิ่งที่ได้", row.outContent], ["สตาฟ", row.outStaff], ["ที่เที่ยว", row.outTravel], ["ที่พัก อาหาร และอื่นๆ", row.outOther]]
          : [["เนื้อหา / สิ่งที่ได้", row.content], ["พี่เด้น", row.seniors], ["อาจารย์", row.teachers], ["อื่นๆ", row.other]],
      ),
      threeWords: text(row.threeWords),
      province: outside ? text(row.outProvince) : null,
    };
  });
}

export function parseSI130(rows: Row[], aliases: Aliases): ElectiveReview[] {
  return approvedRows(rows).map(({ row, index }) => {
    const wardRaw = text(row.ward) ?? "";
    return {
      id: `SI130-${index}`,
      year: "SI130",
      hospital: hospitalName(aliases, row.hospital),
      wardRaw,
      specialtyId: stepId(aliases, "department", wardRaw, SPECIALTIES),
      overall: parseScore(row.overall ?? "", "ความพึงพอใจในภาพรวม", 5),
      extra: [parseScore(row.learned ?? "", "ความรู้ใหม่", 5), parseScore(row.chill ?? "", "ความชิล", 5)],
      sections: sections([["รีวิว Elective", row.review], ["ฝากถึงน้องๆ", row.advice]]),
      threeWords: null,
      province: null,
    };
  });
}

export function parseHospitals(rows: Row[], aliases: Aliases): HospitalReview[] {
  return approvedRows(rows)
    .filter(({ row }) => text(row.name))
    .map(({ row, index }) => {
      const trackRaw = text(row.track) ?? "";
      const departmentRaw = text(row.department) ?? "";
      return {
        id: `H-${index}`,
        hospital: hospitalName(aliases, row.name),
        summary: text(row.summary),
        scores: HOSPITAL_SCORE_HEADERS.map((label, i) => parseScore(row[`s${i}`] ?? "", label, 5)),
        trackId: stepId(aliases, "track", trackRaw, TRACKS),
        trackRaw,
        specialtyId: stepId(aliases, "department", departmentRaw, SPECIALTIES),
        departmentRaw,
      };
    });
}
