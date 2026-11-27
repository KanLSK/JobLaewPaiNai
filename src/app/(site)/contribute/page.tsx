import type { Metadata } from "next";
import { ContributeForm } from "@/components/contribute/ContributeForm";
import { requireStudent } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { mongoConfigured } from "@/lib/entries";
import type { Kind } from "@/lib/entries/types";
import { sendContribution } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "เพิ่มรีวิว · จบแล้วไปไหน" };

/** Names already on the site; the form still works if they cannot be loaded. */
async function hospitalNames() {
  try {
    const repository = getRepository();
    const [electives, hospitals] = await Promise.all([repository.getElectiveReviews(), repository.getHospitalReviews()]);
    return [...new Set([...electives, ...hospitals].map((r) => r.hospital))].sort((a, b) => a.localeCompare(b, "th"));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function ContributePage({ searchParams }: { searchParams: Promise<{ kind?: string | string[]; step?: string | string[] }> }) {
  await requireStudent();
  const { kind, step } = await searchParams;
  const initialKind: Kind = kind === "hospital" || kind === "note" ? kind : "elective";
  return (
    <div className="mx-auto max-w-2xl pb-10">
      <h1 className="mb-2 text-3xl font-bold">เพิ่มรีวิว</h1>
      {mongoConfigured(process.env) ? (
        <>
          <p className="mb-4 text-muted">แบ่งปันประสบการณ์ให้รุ่นน้อง ทุกรายการจะถูกตรวจก่อนแสดงบนเว็บ</p>
          <ContributeForm
            key={`${initialKind}-${step}`}
            action={sendContribution}
            hospitals={await hospitalNames()}
            initialKind={initialKind}
            initialStep={typeof step === "string" ? step : undefined}
          />
        </>
      ) : (
        <p className="text-muted">ยังไม่เปิดใช้งาน</p>
      )}
    </div>
  );
}
