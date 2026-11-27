const DEFAULT_DOMAINS = ["student.mahidol.edu", "student.mahidol.ac.th"];

export function allowedDomains(env: string | undefined = process.env.ALLOWED_EMAIL_DOMAINS): string[] {
  const list = (env ?? "").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  return list.length ? list : [...DEFAULT_DOMAINS];
}

export function isAllowedEmail(email: string | null | undefined, domains: string[]): boolean {
  const parts = (email ?? "").split("@");
  return parts.length === 2 && parts[0] !== "" && domains.includes(parts[1].toLowerCase());
}

export function isAllowedProfile(
  profile: { email?: string | null; email_verified?: boolean | null },
  domains: string[],
): boolean {
  return profile.email_verified === true && isAllowedEmail(profile.email, domains);
}

export function devBypassEnabled(env: Record<string, string | undefined>): boolean {
  return env.NODE_ENV === "development" && env.DATA_SOURCE === "csv" && env.AUTH_DEV_BYPASS === "1";
}

/** Only a path on this site; anything that a browser could read as another host becomes "/". */
export function safeCallback(value: string | undefined): string {
  if (!value || !value.startsWith("/")) return "/";
  const base = "http://local.invalid";
  try {
    const url = new URL(value, base);
    return url.origin === base ? url.pathname + url.search : "/";
  } catch {
    return "/";
  }
}
