import type { Metadata } from "next";
import { adminPassword, isAdmin } from "@/lib/admin/session";
import { requireStudent } from "@/lib/auth/session";
import { mongoConfigured } from "@/lib/entries";
import { logIn, logOut } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ผู้ดูแล · จบแล้วไปไหน" };

const button = "cursor-pointer rounded-full border-2 border-ink px-4 py-2 font-semibold";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ failed?: string }> }) {
  await requireStudent();
  const available = mongoConfigured(process.env) && adminPassword(process.env) !== null;
  const { failed } = await searchParams;

  if (!available) return <p className="text-muted">ยังไม่เปิดใช้งาน (ต้องตั้งค่า MongoDB และ ADMIN_PASSWORD อย่างน้อย 12 ตัวอักษร)</p>;

  if (!(await isAdmin()))
    return (
      <form action={logIn} className="mx-auto max-w-sm space-y-3">
        <h1 className="text-3xl font-bold">ผู้ดูแล</h1>
        {failed && <p role="alert" className="font-semibold text-red-700">เข้าสู่ระบบไม่สำเร็จ ถ้าลองหลายครั้งให้รอ 15 นาที</p>}
        <label className="block font-semibold">
          รหัสผ่าน
          <input type="password" name="password" required autoComplete="current-password" className="mt-1 w-full rounded-xl border-2 border-ink bg-white px-3 py-2" />
        </label>
        <button className={`${button} bg-graduate`}>เข้าสู่ระบบ</button>
      </form>
    );

  return (
    <form action={logOut}>
      <button className={`${button} bg-white`}>ออกจากระบบผู้ดูแล</button>
    </form>
  );
}
