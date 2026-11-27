import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Chooser } from "@/components/contribute/Chooser";
import { requireStudent } from "@/lib/auth/session";
import { mongoConfigured } from "@/lib/entries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "เพิ่มรีวิว · จบแล้วไปไหน" };

export default async function ContributePage({ searchParams }: { searchParams: Promise<{ kind?: string | string[]; step?: string | string[] }> }) {
  await requireStudent();
  const { kind, step } = await searchParams;
  // Links made before each form had its own page.
  if (kind === "elective" || kind === "hospital" || kind === "note")
    redirect(`/contribute/${kind}${typeof step === "string" ? `?step=${encodeURIComponent(step)}` : ""}`);

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <h1 className="mb-2 text-center text-3xl font-bold">เพิ่มรีวิว</h1>
      {mongoConfigured(process.env) ? (
        <>
          <p className="mb-8 text-center text-muted">อยากแบ่งปันเรื่องไหน? ทุกรายการจะถูกตรวจก่อนแสดงบนเว็บ</p>
          <Chooser />
        </>
      ) : (
        <p className="text-center text-muted">ยังไม่เปิดใช้งาน</p>
      )}
    </div>
  );
}
