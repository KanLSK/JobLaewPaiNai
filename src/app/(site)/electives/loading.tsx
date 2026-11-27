import { ElectiveList } from "@/components/reviews/ElectiveList";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { electives } from "@/components/skeleton/placeholders";

export default function ElectivesLoading() {
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">รีวิว Elective</h1>
      <Skeleton>
        <ElectiveList reviews={electives} />
      </Skeleton>
    </>
  );
}
