import Link from "next/link";
import { signOut } from "@/auth";
import { devBypassEnabled } from "@/lib/auth/allowed";
import { requireStudent } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const NAV = [
  ["/", "เส้นทาง"],
  ["/electives", "Elective"],
  ["/hospitals", "โรงพยาบาลใช้ทุน"],
] as const;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  await requireStudent();
  const report = process.env.REPORT_URL;

  async function leave() {
    "use server";
    await signOut({ redirectTo: "/signin" });
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
        <Link href="/" className="font-display text-2xl font-bold">จบแล้วไปไหน</Link>
        <nav className="flex flex-wrap gap-2 text-sm font-semibold">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full border-2 border-ink bg-white px-3 py-1 hover:bg-graduate">
              {label}
            </Link>
          ))}
        </nav>
        {!devBypassEnabled(process.env) && (
          <form action={leave} className="ml-auto">
            <button className="cursor-pointer text-sm underline">ออกจากระบบ</button>
          </form>
        )}
      </header>
      <main className="flex-1 py-4">{children}</main>
      {report && (
        <footer className="py-6 text-center text-sm">
          <a href={report} className="underline" rel="noreferrer">แจ้งแก้ไขหรือลบรีวิว</a>
        </footer>
      )}
    </div>
  );
}
