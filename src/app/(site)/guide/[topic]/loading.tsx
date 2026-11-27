import { GuidePageContent } from "@/components/guide/GuideContent";
import { TOPICS } from "@/components/guide/topics";
import { Skeleton } from "@/components/skeleton/Skeleton";

export default function GuideTopicLoading() {
  return (
    <Skeleton>
      <GuidePageContent topic={TOPICS[0]} />
    </Skeleton>
  );
}
