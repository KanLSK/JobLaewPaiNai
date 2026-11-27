import { Quiz } from "@/components/quiz/Quiz";
import { Skeleton } from "@/components/skeleton/Skeleton";

export default function QuizLoading() {
  return (
    <Skeleton>
      <Quiz />
    </Skeleton>
  );
}
