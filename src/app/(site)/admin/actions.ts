"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, SESSION_SECONDS, adminPassword, attemptLogin, makeToken } from "@/lib/admin/session";
import { getStore, mongoConfigured } from "@/lib/entries";
import { addressFrom } from "@/lib/entries/address";

export async function logIn(formData: FormData): Promise<void> {
  const password = adminPassword(process.env);
  if (!password || !mongoConfigured(process.env)) redirect("/admin");
  const ok = await attemptLogin(
    { rates: getStore(), password, address: addressFrom(await headers()) },
    String(formData.get("password") ?? ""),
  );
  if (!ok) redirect("/admin?failed=1");
  (await cookies()).set(ADMIN_COOKIE, makeToken(password), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  redirect("/admin");
}

export async function logOut(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}
