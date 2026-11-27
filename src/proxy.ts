import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { allowedDomains, isAllowedEmail, loginRequired } from "@/lib/auth/allowed";

const guard = auth((request) => {
  if (isAllowedEmail(request.auth?.user?.email, allowedDomains())) return NextResponse.next();
  const target = new URL("/signin", request.nextUrl);
  target.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(target);
}) as unknown as (request: NextRequest, event: NextFetchEvent) => Promise<Response>;

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  // Decided before Auth.js runs, so no secret is needed while login is off.
  if (!loginRequired(process.env)) return NextResponse.next();
  return guard(request, event);
}

export const config = {
  matcher: ["/((?!signin$|api/auth/|_next/static|_next/image|robots\\.txt$|icon\\.svg$|favicon\\.ico$).*)"],
};
