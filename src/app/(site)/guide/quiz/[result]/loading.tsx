import { RESULTS } from "@/components/quiz/data";
import { QuizResult } from "@/components/quiz/QuizResult";
import { Skeleton } from "@/components/skeleton/Skeleton";

export default function QuizResultLoading() {
  return (
    <Skeleton>
      <QuizResult result={RESULTS.surgery} notes={[[]]} />
    </Skeleton>
  );
}
