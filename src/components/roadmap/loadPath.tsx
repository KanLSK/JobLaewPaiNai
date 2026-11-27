import { requireStudent } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { mongoConfigured } from "@/lib/entries";
import { PathPage } from "./PathPage";
import type { Path } from "./paths";

export async function loadPath(page: Path, searchParams: Promise<{ step?: string | string[] }>) {
  await requireStudent();
  const { step } = await searchParams;
  const stepId = page.steps.find((s) => s.id === step)?.id;
  const repository = getRepository();
  const [counts, content] = await Promise.all([
    repository.getStepCounts(),
    stepId ? repository.getStepReviews(stepId) : { electives: [], hospitals: [], notes: [] },
  ]);
  return <PathPage page={page} stepId={stepId} counts={counts} content={content} canContribute={mongoConfigured(process.env)} />;
}
