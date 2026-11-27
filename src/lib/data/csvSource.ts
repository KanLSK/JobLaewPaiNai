import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { headerRowCount, resolveColumns } from "./columns";
import type { TableId, TableSource } from "./types";

export function csvSource(files: Record<TableId, string>): TableSource {
  return {
    async readTable(table, columns) {
      const text = await readFile(files[table], "utf8");
      const lines: string[][] = parse(text, { bom: true, relax_column_count: true });
      const { indexes, dataStart } = resolveColumns(lines.slice(0, headerRowCount(table)), columns, table);
      return lines.slice(dataStart).map((line) =>
        Object.fromEntries(columns.map((c) => [c.key, line[indexes[c.key]] ?? ""])),
      );
    },
  };
}
