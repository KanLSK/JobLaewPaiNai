import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RESULTS } from "@/components/quiz/data";
import { QuizResult } from "@/components/quiz/QuizResult";
import { requireStudent } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { mongoConfigured } from "@/lib/entries";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ result: string }>;
}

const find = async (params: Props["params"]) => {
  const { result } = await params;
  return Object.hasOwn(RESULTS, result) ? RESULTS[result] : undefined;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${(await find(params))?.title ?? "เรียนต่ออะไรดี?"} · จบแล้วไปไหน` };
}

export default async function QuizResultPage({ params }: Props) {
  await requireStudent();
  const result = await find(params);
  if (!result) notFound();
  const repository = getRepository();
  const notes = await Promise.all(result.specialties.map(async (id) => (await repository.getStepReviews(id)).notes));
  return <QuizResult result={result} notes={notes} canContribute={mongoConfigured(process.env)} />;
}
