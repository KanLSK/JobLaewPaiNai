export type TableId = "si129" | "si130" | "hospitals" | "aliases";

export interface ColumnSpec {
  key: string;
  header: string;
  /** 1-based, for sheets that repeat a header. */
  occurrence?: number;
  optional?: boolean;
}

export type Row = Record<string, string>;

export interface TableSource {
  readTable(table: TableId, columns: ColumnSpec[]): Promise<Row[]>;
}

export interface Score {
  label: string;
  value: number | null;
  max: 5 | 10;
}

export interface ElectiveReview {
  id: string;
  /** Student generation, e.g. "SI130". */
  year: string;
  hospital: string;
  wardRaw: string;
  specialtyId: string | null;
  overall: Score;
  extra: Score[];
  sections: { label: string; text: string }[];
  threeWords: string | null;
  province: string | null;
}

export interface HospitalReview {
  id: string;
  hospital: string;
  summary: string | null;
  scores: Score[];
  trackId: string | null;
  trackRaw: string;
  specialtyId: string | null;
  departmentRaw: string;
}

/** A short experience attached to one roadmap step. */
export interface NoteEntry {
  id: string;
  stepId: string;
  title: string;
  text: string;
}
