import { GuideIndex } from "@/components/guide/GuideContent";
import { Skeleton } from "@/components/skeleton/Skeleton";

export default function GuideLoading() {
  return (
    <Skeleton>
      <GuideIndex />
    </Skeleton>
  );
}
