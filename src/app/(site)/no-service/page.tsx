import type { Metadata } from "next";
import { loadPath } from "@/components/roadmap/loadPath";
import { NO_SERVICE_PAGE } from "@/components/roadmap/paths";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: `${NO_SERVICE_PAGE.title} · จบแล้วไปไหน` };

export default function NoServiceRoute({ searchParams }: { searchParams: Promise<{ step?: string | string[] }> }) {
  return loadPath(NO_SERVICE_PAGE, searchParams);
}
