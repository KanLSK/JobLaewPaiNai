import { EntryEditor } from "@/components/admin/EntryEditor";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { electives } from "@/components/skeleton/placeholders";
import { fields } from "@/lib/admin/fields";
import { moderate } from "./actions";

const { id: _, ...data } = electives[0];
const sample = fields({ id: "placeholder", kind: "elective", status: "pending", source: "form", data, createdAt: new Date(0) });
const pill = "rounded-full border-2 border-ink bg-white px-3 py-1";

export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-10">
      <h1 className="text-3xl font-bold">ผู้ดูแล</h1>
      <Skeleton>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            {["รอตรวจ", "อนุมัติแล้ว", "ไม่อนุมัติ"].map((tab) => (
              <span key={tab} className={pill}>{tab}</span>
            ))}
          </div>
          <input type="search" placeholder="ค้นหา…" className="w-full rounded-xl border-2 border-ink bg-white px-3 py-2" />
          {[0, 1].map((i) => (
            <EntryEditor key={i} action={moderate} id="" status="pending" heading="Elective" fields={sample} version="" />
          ))}
        </div>
      </Skeleton>
    </div>
  );
}
