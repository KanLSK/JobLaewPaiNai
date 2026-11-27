import path from "node:path";
import { buildAliases, type Aliases } from "@/lib/data/aliases";
import { ALIAS_COLUMNS } from "@/lib/data/columns";
import { csvSource } from "@/lib/data/csvSource";

export async function loadAliases(): Promise<Aliases> {
  const file = path.join(process.cwd(), "config", "aliases.csv");
  const source = csvSource({ aliases: file, si129: file, si130: file, hospitals: file });
  return buildAliases(await source.readTable("aliases", ALIAS_COLUMNS));
}
