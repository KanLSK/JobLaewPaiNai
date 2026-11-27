import { HospitalDetail } from "@/components/reviews/HospitalDetail";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { hospitals } from "@/components/skeleton/placeholders";

export default function HospitalLoading() {
  return (
    <Skeleton>
      <HospitalDetail found={{ name: "ชื่อโรงพยาบาล", reviews: hospitals.slice(0, 2) }} />
    </Skeleton>
  );
}
