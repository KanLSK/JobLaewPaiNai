import type { Metadata } from "next";
import directory from "../../../../../content/hospital-directory.json";
import { HospitalMap } from "@/components/hospitals/HospitalMap";
import { requireStudent } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { isRegion } from "@/lib/hospitalMap";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "โรงพยาบาลใช้ทุน · จบแล้วไปไหน" };

export default async function HospitalsPage({ searchParams }: { searchParams: Promise<{ region?: string | string[] }> }) {
  await requireStudent();
  const [reviews, { region }] = await Promise.all([getRepository().getHospitalReviews(), searchParams]);
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">โรงพยาบาลใช้ทุน</h1>
      <HospitalMap hospitals={directory} reviews={reviews} initialRegion={isRegion(region) ? region : undefined} />
    </>
  );
}
