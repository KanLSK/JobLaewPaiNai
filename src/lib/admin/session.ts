import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { hashAddress } from "@/lib/entries/address";
import type { RateStore } from "@/lib/entries/types";

export const ADMIN_COOKIE = "admin";
export const SESSION_SECONDS = 8 * 60 * 60;
const MIN_LENGTH = 12;
const ATTEMPTS = 5;
const WINDOW = 15 * 60 * 1000;

export function adminPassword(env: Record<string, string | undefined>): string | null {
  const value = env.ADMIN_PASSWORD ?? "";
  return value.length >= MIN_LENGTH ? value : null;
}

const digest = (value: string) => createHash("sha256").update(value).digest();

export const checkPassword = (given: string, actual: string) => timingSafeEqual(digest(given), digest(actual));

const sign = (expiry: string, password: string) => createHmac("sha256", password).update(expiry).digest("hex");

export function makeToken(password: string, now = Date.now()): string {
  const expiry = String(now + SESSION_SECONDS * 1000);
  return `${expiry}.${sign(expiry, password)}`;
}

export function validToken(token: string | undefined, password: string, now = Date.now()): boolean {
  const [expiry, signature] = (token ?? "").split(".");
  if (!expiry || !signature || !(Number(expiry) >= now)) return false;
  return timingSafeEqual(digest(signature), digest(sign(expiry, password)));
}

/** Every attempt is counted before the password is looked at. */
export async function attemptLogin(deps: { rates: RateStore; password: string; address: string }, given: string): Promise<boolean> {
  if ((await deps.rates.hit(`login:${hashAddress(deps.address)}`, WINDOW)) > ATTEMPTS) return false;
  return checkPassword(given, deps.password);
}

export async function isAdmin(): Promise<boolean> {
  const password = adminPassword(process.env);
  return password !== null && validToken((await cookies()).get(ADMIN_COOKIE)?.value, password);
}

/** First line of every admin action: each is a public endpoint of its own. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Not signed in as admin");
}
