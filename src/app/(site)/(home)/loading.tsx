import { Roadmap } from "@/components/roadmap/Roadmap";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { mapCounts } from "@/components/skeleton/placeholders";

export default function PathwayLoading() {
  return (
    <>
      <h1 className="text-center text-3xl font-bold">จบแล้วไปไหน?</h1>
      <p className="mb-8 text-center text-muted">กดที่แต่ละขั้นเพื่ออ่านรีวิว</p>
      <Skeleton>
        <Roadmap counts={mapCounts} selected={null} />
      </Skeleton>
    </>
  );
}
