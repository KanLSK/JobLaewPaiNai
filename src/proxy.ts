import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { allowedDomains, devBypassEnabled, isAllowedEmail } from "@/lib/auth/allowed";

export default auth((request) => {
  if (devBypassEnabled(process.env)) return NextResponse.next();
  if (isAllowedEmail(request.auth?.user?.email, allowedDomains())) return NextResponse.next();
  const target = new URL("/signin", request.nextUrl);
  target.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(target);
});

export const config = {
  matcher: ["/((?!signin$|api/auth/|_next/static|_next/image|robots\\.txt$|favicon\\.ico$).*)"],
};
