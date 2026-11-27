import type { Metadata } from "next";
import { ElectiveList } from "@/components/reviews/ElectiveList";
import { requireStudent } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Elective · จบแล้วไปไหน" };

export default async function ElectivesPage() {
  await requireStudent();
  const reviews = await getRepository().getElectiveReviews();
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">รีวิว Elective</h1>
      <ElectiveList reviews={reviews} />
    </>
  );
}
