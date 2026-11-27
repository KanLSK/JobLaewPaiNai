import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePageContent } from "@/components/guide/GuideContent";
import { TOPICS } from "@/components/guide/topics";
import { requireStudent } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ topic: string }>;
}

const find = async (params: Props["params"]) => {
  const { topic } = await params;
  return TOPICS.find((t) => t.id === topic);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${(await find(params))?.title ?? "คู่มือ"} · จบแล้วไปไหน` };
}

export default async function GuideTopicPage({ params }: Props) {
  await requireStudent();
  const topic = await find(params);
  if (!topic) notFound();
  return <GuidePageContent topic={topic} />;
}
