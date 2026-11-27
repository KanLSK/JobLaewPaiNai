import { Chooser } from "@/components/contribute/Chooser";
import { Skeleton } from "@/components/skeleton/Skeleton";

export default function ContributeLoading() {
  return (
    <div className="mx-auto max-w-3xl pb-10">
      <h1 className="mb-2 text-center text-3xl font-bold">เพิ่มรีวิว</h1>
      <Skeleton>
        <p className="mb-8 text-center text-muted">อยากแบ่งปันเรื่องไหน? ทุกรายการจะถูกตรวจก่อนแสดงบนเว็บ</p>
        <Chooser />
      </Skeleton>
    </div>
  );
}
