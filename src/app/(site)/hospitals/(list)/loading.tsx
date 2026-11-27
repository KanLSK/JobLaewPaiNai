import { HospitalList } from "@/components/reviews/HospitalList";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { hospitals } from "@/components/skeleton/placeholders";

export default function HospitalsLoading() {
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">โรงพยาบาลใช้ทุน</h1>
      <Skeleton>
        <HospitalList reviews={hospitals} />
      </Skeleton>
    </>
  );
}
