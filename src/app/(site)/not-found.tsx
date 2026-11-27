import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-ink p-8 text-center">
      <p className="mb-3 font-semibold">ไม่พบหน้านี้</p>
      <Link href="/" className="underline">กลับไปหน้าเส้นทาง</Link>
    </div>
  );
}
