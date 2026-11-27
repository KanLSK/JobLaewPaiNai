import { ContributeForm } from "@/components/contribute/ContributeForm";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { sendContribution } from "./actions";

export default function ContributeLoading() {
  return (
    <div className="mx-auto max-w-2xl pb-10">
      <h1 className="mb-2 text-3xl font-bold">เพิ่มรีวิว</h1>
      <Skeleton>
        <p className="mb-4 text-muted">แบ่งปันประสบการณ์ให้รุ่นน้อง ทุกรายการจะถูกตรวจก่อนแสดงบนเว็บ</p>
        <ContributeForm action={sendContribution} hospitals={[]} initialKind="elective" />
      </Skeleton>
    </div>
  );
}
