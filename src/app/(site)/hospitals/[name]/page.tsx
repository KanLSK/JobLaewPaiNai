import { notFound } from "next/navigation";
import { HospitalDetail } from "@/components/reviews/HospitalDetail";
import { requireStudent } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { reviewsForHospital } from "@/lib/hospitals";

export const dynamic = "force-dynamic";

export default async function HospitalPage({ params }: { params: Promise<{ name: string }> }) {
  await requireStudent();
  const { name } = await params;
  const found = reviewsForHospital(name, await getRepository().getHospitalReviews());
  if (!found) notFound();

  return <HospitalDetail found={found} />;
}
