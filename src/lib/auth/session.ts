import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { allowedDomains, devBypassEnabled, isAllowedEmail } from "./allowed";

export async function requireStudent(): Promise<{ email: string; name: string | null }> {
  if (devBypassEnabled(process.env)) return { email: "dev@localhost", name: "Local preview" };
  const session = await auth();
  const email = session?.user?.email;
  // Checked on every request, so a change to the allowed list applies at once.
  if (!email || !isAllowedEmail(email, allowedDomains())) redirect("/signin");
  return { email, name: session?.user?.name ?? null };
}
