import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { KINDS } from "@/components/contribute/Chooser";
import { ContributeForm } from "@/components/contribute/ContributeForm";
import { contributeHref, noteTopic } from "@/components/contribute/topics";
import { requireStudent } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { mongoConfigured } from "@/lib/entries";
import { sendContribution } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "เพิ่มรีวิว · จบแล้วไปไหน" };

/** Names already on the site; the form still works if they cannot be loaded. */
async function hospitalNames() {
  try {
    return await getRepository().getHospitalNames();
  } catch (error) {
    console.error(error);
    return [];
  }
}

interface Props {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ step?: string | string[] }>;
}

export default async function ContributeKindPage({ params, searchParams }: Props) {
  await requireStudent();
  const { kind } = await params;
  if (kind !== "elective" && kind !== "hospital" && kind !== "extern" && kind !== "resident" && kind !== "note") notFound();
  const { step } = await searchParams;
  // Extern and Resident used to share the other-path form.
  if (kind === "note" && typeof step === "string" && noteTopic(step) !== "note") redirect(contributeHref(noteTopic(step), step));

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <h1 className="mb-2 text-3xl font-bold">{KINDS[kind].title}</h1>
      {mongoConfigured(process.env) ? (
        <ContributeForm
          key={`${kind}-${step}`}
          action={sendContribution}
          hospitals={kind === "elective" || kind === "hospital" ? await hospitalNames() : []}
          topic={kind}
          initialStep={typeof step === "string" ? step : undefined}
        />
      ) : (
        <p className="text-muted">ยังไม่เปิดใช้งาน</p>
      )}
    </div>
  );
}
