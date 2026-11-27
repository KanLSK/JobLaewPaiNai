"use server";

import { headers } from "next/headers";
import type { FormState } from "@/components/contribute/ContributeForm";
import { requireStudent } from "@/lib/auth/session";
import { getStore, mongoConfigured } from "@/lib/entries";
import { addressFrom } from "@/lib/entries/address";
import { loadAliases } from "@/lib/entries/aliasFile";
import { submitEntry } from "@/lib/entries/submit";

/** A public endpoint: nothing sent here is trusted, and everything saved waits for approval. */
export async function sendContribution(previous: FormState, formData: FormData): Promise<FormState> {
  await requireStudent();
  const form = Object.fromEntries([...formData].filter((pair): pair is [string, string] => typeof pair[1] === "string"));
  const kind = form.kind;
  const attempt = (previous?.attempt ?? 0) + 1;
  if (kind !== "elective" && kind !== "hospital" && kind !== "note") throw new Error("Unknown kind");
  if (!mongoConfigured(process.env)) return { kind, attempt, ok: false, message: "ยังไม่เปิดใช้งาน", errors: {}, values: form };
  const result = await submitEntry(
    { store: getStore(), aliases: await loadAliases(), address: addressFrom(await headers()) },
    kind,
    form,
  );
  return { kind, attempt, ...result };
}
