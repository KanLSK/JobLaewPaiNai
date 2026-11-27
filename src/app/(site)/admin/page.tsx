import type { Metadata } from "next";
import Link from "next/link";
import { EntryEditor } from "@/components/admin/EntryEditor";
import { fields } from "@/lib/admin/fields";
import { adminPassword, isAdmin } from "@/lib/admin/session";
import { requireStudent } from "@/lib/auth/session";
import { getStore, mongoConfigured } from "@/lib/entries";
import type { Entry, Status } from "@/lib/entries/types";
import { logIn, logOut, moderate } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ผู้ดูแล · จบแล้วไปไหน" };

const button = "cursor-pointer rounded-full border-2 border-ink px-4 py-2 font-semibold";

const TABS: [Status, string][] = [["pending", "รอตรวจ"], ["approved", "อนุมัติแล้ว"], ["rejected", "ไม่อนุมัติ"]];
const KINDS = { elective: "Elective", hospital: "โรงพยาบาลใช้ทุน", note: "เส้นทางอื่น" };
const DONE: Record<string, string> = {
  approved: "อนุมัติแล้ว จะขึ้นเว็บภายในประมาณหนึ่งนาที",
  rejected: "ไม่อนุมัติแล้ว",
  unpublished: "เอาออกแล้ว จะหายจากเว็บภายในประมาณหนึ่งนาที",
  deleted: "ลบถาวรแล้ว",
  gone: "ไม่พบรายการนี้แล้ว",
};
const PAGE = 20;

const heading = (e: Entry) =>
  `${KINDS[e.kind]} · ${e.source === "import" ? "นำเข้า" : e.createdAt.toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" })}`;

type Query = { failed?: string; tab?: string; done?: string; q?: string; page?: string };

export default async function AdminPage({ searchParams }: { searchParams: Promise<Query> }) {
  await requireStudent();
  const available = mongoConfigured(process.env) && adminPassword(process.env) !== null;
  const { failed, tab, done, q = "", page } = await searchParams;

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

  const status = TABS.find(([id]) => id === tab)?.[0] ?? "pending";
  const store = getStore();
  const [entries, counts] = await Promise.all([store.list(status), Promise.all(TABS.map(([id]) => store.count(id)))]);
  const needle = q.trim().toLowerCase();
  const found = needle ? entries.filter((e) => JSON.stringify(e.data).toLowerCase().includes(needle)) : entries;
  const pages = Math.max(1, Math.ceil(found.length / PAGE));
  const at = Math.min(pages, Math.max(1, Math.floor(Number(page)) || 1));
  const href = (to: number) => `/admin?${new URLSearchParams({ tab: status, q, page: String(to) })}`;

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">ผู้ดูแล</h1>
        <form action={logOut}>
          <button className={`${button} bg-white`}>ออกจากระบบ</button>
        </form>
      </div>
      <nav className="flex flex-wrap gap-2 text-sm font-semibold">
        {TABS.map(([id, label], i) => (
          <Link key={id} href={`/admin?tab=${id}`} aria-current={id === status ? "page" : undefined} className={`rounded-full border-2 border-ink px-3 py-1 ${id === status ? "bg-graduate" : "bg-white"}`}>
            {label} ({counts[i]})
          </Link>
        ))}
      </nav>
      {done && DONE[done] && <p role="status" className="rounded-xl border-2 border-ink bg-resident px-3 py-2 font-semibold">{DONE[done]}</p>}
      <p className="text-sm text-muted">ข้อความที่ <mark className="bg-graduate">ไฮไลต์</mark> อาจเป็นชื่อหรือข้อมูลติดต่อ ระบบหาไม่ครบ กรุณาอ่านทุกรายการ</p>
      <form className="flex gap-2">
        <input type="hidden" name="tab" value={status} />
        <input type="search" name="q" defaultValue={q} aria-label="ค้นหา" placeholder="ค้นหา…" className="min-w-0 flex-1 rounded-xl border-2 border-ink bg-white px-3 py-2" />
        <button className={`${button} bg-white`}>ค้นหา</button>
      </form>
      {found.length === 0 && <p className="text-muted">ไม่มีรายการ</p>}
      {found.slice((at - 1) * PAGE, at * PAGE).map((e) => (
        <EntryEditor key={e.id} action={moderate} id={e.id} status={status} heading={heading(e)} fields={fields(e)} />
      ))}
      {pages > 1 && (
        <p className="flex justify-between text-sm font-semibold">
          {at > 1 ? <Link href={href(at - 1)} className="underline">← ก่อนหน้า</Link> : <span />}
          <span>หน้า {at}/{pages}</span>
          {at < pages ? <Link href={href(at + 1)} className="underline">ถัดไป →</Link> : <span />}
        </p>
      )}
    </div>
  );
}
