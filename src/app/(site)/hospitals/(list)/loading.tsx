import directory from "../../../../../content/hospital-directory.json";
import { HospitalMap } from "@/components/hospitals/HospitalMap";
import { Skeleton } from "@/components/skeleton/Skeleton";

export default function HospitalsLoading() {
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">โรงพยาบาลใช้ทุน</h1>
      <Skeleton>
        <HospitalMap hospitals={directory} reviews={[]} />
      </Skeleton>
    </>
  );
}
