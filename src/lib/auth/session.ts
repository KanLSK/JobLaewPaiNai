import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { allowedDomains, isAllowedEmail, loginRequired } from "./allowed";

/** Returns null when login is off; otherwise the signed-in student, or redirects. */
export async function requireStudent(): Promise<{ email: string; name: string | null } | null> {
  if (!loginRequired(process.env)) return null;
  const session = await auth();
  const email = session?.user?.email;
  // Checked on every request, so a change to the allowed list applies at once.
  if (!email || !isAllowedEmail(email, allowedDomains())) redirect("/signin");
  return { email, name: session?.user?.name ?? null };
}
