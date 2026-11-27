import path from "node:path";
import { JWT } from "google-auth-library";
import { getStore } from "@/lib/entries";
import { buildAliases } from "./aliases";
import { cached } from "./cache";
import { ALIAS_COLUMNS, HOSPITAL_COLUMNS, SI129_COLUMNS, SI130_COLUMNS } from "./columns";
import { csvSource } from "./csvSource";
import { parseHospitals, parseSI129, parseSI130 } from "./parse";
import { mongoRepository } from "./mongoRepository";
import { sheetsSource } from "./sheetsSource";
import { fileRepository } from "./snapshot";
import type { ColumnSpec, ElectiveReview, HospitalReview, NoteEntry, TableId, TableSource } from "./types";

export interface ReviewRepository {
  getElectiveReviews(): Promise<ElectiveReview[]>;
  getHospitalReviews(): Promise<HospitalReview[]>;
  getNotes(): Promise<NoteEntry[]>;
}

const TEN_MINUTES = 10 * 60 * 1000;

export function createRepository(source: TableSource, opts: { approveAll?: boolean; ttlMs?: number } = {}): ReviewRepository {
  const ttl = opts.ttlMs ?? TEN_MINUTES;
  const read = async (table: TableId, columns: ColumnSpec[]) => {
    const rows = await source.readTable(table, columns);
    return opts.approveAll ? rows.map((row) => ({ ...row, approved: "yes" })) : rows;
  };
  const aliases = async () => buildAliases(await source.readTable("aliases", ALIAS_COLUMNS));

  return {
    getElectiveReviews: cached(async () => {
      const [a, si129, si130] = await Promise.all([aliases(), read("si129", SI129_COLUMNS), read("si130", SI130_COLUMNS)]);
      return [...parseSI130(si130, a), ...parseSI129(si129, a)];
    }, ttl),
    getHospitalReviews: cached(async () => {
      const [a, rows] = await Promise.all([aliases(), read("hospitals", HOSPITAL_COLUMNS)]);
      return parseHospitals(rows, a);
    }, ttl),
    // Notes only come in through the website forms.
    getNotes: async () => [],
  };
}

export function approveAllEnabled(env: Record<string, string | undefined>): boolean {
  return env.NODE_ENV === "development" && env.DATA_SOURCE === "csv" && env.DEV_APPROVE_ALL === "1";
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export const CSV_FILES = {
  si129: "Review Elective SI129 - Form Responses 1.csv",
  si130: "Review Elective SI130 (Responses) - Form Responses 1.csv",
  hospitals: "Copy of โรงพยาบาลใช้ทุน_Data - ข้อมูลที่อยากได้รีวิว (ตัวอย่าง).csv",
};

function localCsv(): TableSource {
  const data = (file: string) => path.join(process.cwd(), "Data", file);
  return csvSource({
    si129: data(CSV_FILES.si129),
    si130: data(CSV_FILES.si130),
    hospitals: data(CSV_FILES.hospitals),
    aliases: path.join(process.cwd(), "config", "aliases.csv"),
  });
}

function googleSheet(): TableSource {
  const client = new JWT({
    email: required("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    key: required("GOOGLE_SERVICE_ACCOUNT_KEY").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return sheetsSource({
    sheetId: required("SHEET_ID"),
    tabs: {
      si129: process.env.SHEET_TAB_SI129 || "SI129",
      si130: process.env.SHEET_TAB_SI130 || "SI130",
      hospitals: process.env.SHEET_TAB_HOSPITALS || "hospitals",
      aliases: process.env.SHEET_TAB_ALIASES || "aliases",
    },
    getToken: async () => {
      const { token } = await client.getAccessToken();
      if (!token) throw new Error("Google did not return an access token");
      return token;
    },
  });
}

let repository: ReviewRepository | null = null;

export function getRepository(): ReviewRepository {
  if (!repository) {
    // With no setting the site runs on its own from the file shipped with it.
    const kind = process.env.DATA_SOURCE || "file";
    if (kind === "mongodb") repository = mongoRepository(getStore());
    else if (kind === "file") repository = fileRepository(path.join(process.cwd(), "content", "reviews.json"));
    else if (kind === "csv" || kind === "sheets")
      repository = createRepository(kind === "csv" ? localCsv() : googleSheet(), { approveAll: approveAllEnabled(process.env) });
    else throw new Error(`DATA_SOURCE must be "file", "mongodb", "csv" or "sheets"`);
  }
  return repository;
}
