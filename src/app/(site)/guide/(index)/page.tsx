import type { Metadata } from "next";
import { GuideIndex } from "@/components/guide/GuideContent";
import { requireStudent } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "คู่มือ · จบแล้วไปไหน" };

export default async function GuidePage() {
  await requireStudent();
  return <GuideIndex />;
}
