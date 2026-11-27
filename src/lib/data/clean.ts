import { normaliseHeader } from "./columns";

/** Columns that never leave the original files. */
const PRIVATE = [/^Timestamp$/, /^Rotate$/, /^รหัสนักศึกษา$/, /^ข้อมูลติดต่อรพ/];

export interface Redaction {
  id: string;
  pattern: RegExp;
  find: string;
  replace: string;
}

/**
 * One per line: review id, text to find, replacement (tab-separated).
 * A space matches any whitespace; "…" matches everything between two pieces.
 */
export function parseRedactions(text: string): Redaction[] {
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ +/g, "\\s+");
  return text
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .map((line) => {
      const [id, find, replace = ""] = line.split("\t");
      return { id, find, replace, pattern: new RegExp(find.split("…").map(escape).join("[\\s\\S]*?"), "g") };
    });
}

/** Ids are `<prefix>-<n>`, n counting rows after the header, as in the parsers. */
export function cleanTable(lines: string[][], prefix: string, headerRows: number, redactions: Redaction[]): string[][] {
  const header = lines[0];
  const keep = header.map((h, i) => (PRIVATE.some((p) => p.test(normaliseHeader(h))) ? -1 : i)).filter((i) => i >= 0);
  const used = new Set<Redaction>();

  const out = lines.map((line, n) => {
    const mine = n < headerRows ? [] : redactions.filter((r) => r.id === `${prefix}-${n - headerRows}`);
    return keep.map((i) =>
      mine.reduce((cell, r) => {
        const next = cell.replace(r.pattern, r.replace);
        if (next !== cell) used.add(r);
        return next;
      }, line[i] ?? ""),
    );
  });

  const missed = redactions.find((r) => r.id.startsWith(`${prefix}-`) && !used.has(r));
  if (missed) throw new Error(`Redaction matched nothing: ${missed.id} "${missed.find}"`);
  return out;
}

export const toCsv = (rows: string[][]) =>
  rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n") + "\n";
