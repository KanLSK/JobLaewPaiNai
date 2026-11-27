import type { Row } from "./types";

export type AliasKind = "hospital" | "department" | "track";
export type Aliases = Record<AliasKind, Map<string, string>>;

export const aliasKey = (value: string) => value.replace(/\s+/g, "").toLowerCase();

export function buildAliases(rows: Row[]): Aliases {
  const aliases: Aliases = { hospital: new Map(), department: new Map(), track: new Map() };
  for (const { kind = "", from = "", to = "" } of rows) {
    const map = aliases[kind.trim().toLowerCase() as AliasKind];
    if (map instanceof Map && from.trim() && to.trim()) map.set(aliasKey(from), to.trim());
  }
  return aliases;
}

export function canonical(aliases: Aliases, kind: AliasKind, value: string): string {
  return aliases[kind].get(aliasKey(value)) ?? value;
}
