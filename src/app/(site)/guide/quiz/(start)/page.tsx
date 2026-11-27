import type { Metadata } from "next";
import { Quiz } from "@/components/quiz/Quiz";
import { requireStudent } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "เรียนต่ออะไรดี? · จบแล้วไปไหน" };

export default async function QuizPage() {
  await requireStudent();
  return <Quiz />;
}
