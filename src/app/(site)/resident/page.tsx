import type { Metadata } from "next";
import { loadPath } from "@/components/roadmap/loadPath";
import { RESIDENT_PAGE } from "@/components/roadmap/paths";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: `${RESIDENT_PAGE.title} · จบแล้วไปไหน` };

export default function ResidentRoute({ searchParams }: { searchParams: Promise<{ step?: string | string[] }> }) {
  return loadPath(RESIDENT_PAGE, searchParams);
}
