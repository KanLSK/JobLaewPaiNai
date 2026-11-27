import { RoadmapView } from "@/components/roadmap/RoadmapView";
import { requireStudent } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { mongoConfigured } from "@/lib/entries";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ step?: string | string[] }> }) {
  await requireStudent();
  const { step } = await searchParams;
  const stepId = typeof step === "string" ? step : undefined;
  const repository = getRepository();
  // Counts for the map; review text only for the step that is open.
  const [counts, content] = await Promise.all([
    repository.getStepCounts(),
    stepId ? repository.getStepReviews(stepId) : { electives: [], hospitals: [], notes: [] },
  ]);
  return (
    <>
      <h1 className="text-center text-3xl font-bold">จบแล้วไปไหน?</h1>
      <p className="mb-8 text-center text-muted">กดที่แต่ละขั้นเพื่ออ่านรีวิว</p>
      <RoadmapView
        stepId={stepId}
        counts={counts}
        electives={content.electives}
        hospitals={content.hospitals}
        notes={content.notes}
        canContribute={mongoConfigured(process.env)}
      />
    </>
  );
}
