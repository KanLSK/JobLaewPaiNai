import type { Metadata } from "next";
import { HospitalList } from "@/components/reviews/HospitalList";
import { requireStudent } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "โรงพยาบาลใช้ทุน · จบแล้วไปไหน" };

export default async function HospitalsPage() {
  await requireStudent();
  const reviews = await getRepository().getHospitalReviews();
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">โรงพยาบาลใช้ทุน</h1>
      <HospitalList reviews={reviews} />
    </>
  );
}
