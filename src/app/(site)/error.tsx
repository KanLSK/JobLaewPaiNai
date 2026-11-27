"use client";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border-2 border-ink bg-intern p-8 text-center shadow-sticker">
      <p className="mb-4 font-semibold">โหลดข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง</p>
      <button onClick={() => retry()} className="cursor-pointer rounded-full border-2 border-ink bg-white px-4 py-2 font-semibold">ลองใหม่</button>
    </div>
  );
}
