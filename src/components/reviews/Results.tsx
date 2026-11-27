export function Results({ total, shown, equalHeights = false, children }: { total: number; shown: number; equalHeights?: boolean; children: React.ReactNode }) {
  if (total === 0) return <Empty>รอข้อมูล</Empty>;
  if (shown === 0) return <Empty>ไม่พบรีวิวที่ตรงกัน</Empty>;
  return (
    <>
      <p aria-live="polite" className="mb-3 text-sm text-muted">{shown} รีวิว</p>
      <div className={`grid gap-5 md:grid-cols-2 xl:grid-cols-3 ${equalHeights ? "auto-rows-fr" : "items-start"}`}>{children}</div>
    </>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border-2 border-dashed border-ink p-8 text-center text-muted">{children}</p>;
}
