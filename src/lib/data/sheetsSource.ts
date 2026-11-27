import { HOSPITAL_ANCHOR, MissingColumnError, columnLetter, normaliseHeader, resolveColumns } from "./columns";
import type { TableId, TableSource } from "./types";

interface Options {
  sheetId: string;
  tabs: Record<TableId, string>;
  getToken: () => Promise<string>;
  fetchImpl?: typeof fetch;
}

type ValueRanges = { valueRanges?: { values?: string[][] }[] };

export function sheetsSource({ sheetId, tabs, getToken, fetchImpl = fetch }: Options): TableSource {
  async function batchGet(ranges: string[], majorDimension: "ROWS" | "COLUMNS"): Promise<string[][][]> {
    const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values:batchGet`);
    url.searchParams.set("majorDimension", majorDimension);
    for (const range of ranges) url.searchParams.append("ranges", range);
    const response = await fetchImpl(url.toString(), {
      headers: { Authorization: `Bearer ${await getToken()}` },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Google Sheets answered ${response.status}`);
    const body = (await response.json()) as ValueRanges;
    return ranges.map((_, i) => body.valueRanges?.[i]?.values ?? []);
  }

  /** Reads header rows only, never a response row: those hold private columns. */
  async function headers(table: TableId, tab: string): Promise<{ rows: string[][]; offset: number }> {
    if (table !== "hospitals") {
      const [rows] = await batchGet([`${tab}!1:1`], "ROWS");
      return { rows, offset: 0 };
    }
    // Find the header row from column A alone, then read it and its sub-headers.
    const [first] = await batchGet([`${tab}!A1:A5`], "ROWS");
    const offset = first.findIndex((row) => normaliseHeader(row[0] ?? "").startsWith(HOSPITAL_ANCHOR));
    if (offset < 0) throw new MissingColumnError(table, HOSPITAL_ANCHOR);
    const [rows] = await batchGet([`${tab}!${offset + 1}:${offset + 2}`], "ROWS");
    return { rows, offset };
  }

  return {
    async readTable(table, columns) {
      const tab = `'${tabs[table].replace(/'/g, "''")}'`;
      const { rows: headerRows, offset } = await headers(table, tab);
      const { indexes, dataStart } = resolveColumns(headerRows, columns, table);

      // Only the wanted columns are requested; private ones never leave the sheet.
      const present = columns.filter((c) => indexes[c.key] !== undefined);
      if (!present.length) return [];
      const ranges = present.map((c) => {
        const letter = columnLetter(indexes[c.key]);
        return `${tab}!${letter}${offset + dataStart + 1}:${letter}`;
      });
      const data = (await batchGet(ranges, "COLUMNS")).map((values) => values[0] ?? []);

      const length = Math.max(0, ...data.map((column) => column.length));
      return Array.from({ length }, (_, row) =>
        Object.fromEntries(columns.map((c) => [c.key, data[present.indexOf(c)]?.[row] ?? ""])),
      );
    },
  };
}
