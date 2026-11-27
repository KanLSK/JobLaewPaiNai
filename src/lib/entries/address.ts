import { createHash } from "node:crypto";

/** Addresses are only ever stored as hashes. */
export const hashAddress = (address: string) => createHash("sha256").update(address).digest("hex");

export const addressFrom = (headers: { get(name: string): string | null }) =>
  headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
