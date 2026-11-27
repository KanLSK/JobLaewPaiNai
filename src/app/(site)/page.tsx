import { RoadmapView } from "@/components/roadmap/RoadmapView";
import { requireStudent } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ step?: string | string[] }> }) {
  await requireStudent();
  const { step } = await searchParams;
  const repository = getRepository();
  const [electives, hospitals] = await Promise.all([repository.getElectiveReviews(), repository.getHospitalReviews()]);
  return (
    <>
      <h1 className="text-center text-3xl font-bold">จบแล้วไปไหน?</h1>
      <p className="mb-8 text-center text-muted">กดที่แต่ละขั้นเพื่ออ่านรีวิว</p>
      <RoadmapView stepId={typeof step === "string" ? step : undefined} electives={electives} hospitals={hospitals} />
    </>
  );
}
