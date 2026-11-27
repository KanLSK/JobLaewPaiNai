import { PathPage } from "@/components/roadmap/PathPage";
import { RESIDENT_PAGE } from "@/components/roadmap/paths";
import { Skeleton } from "@/components/skeleton/Skeleton";

export default function ResidentLoading() {
  return (
    <Skeleton>
      <PathPage page={RESIDENT_PAGE} counts={{}} content={{ electives: [], hospitals: [], notes: [] }} />
    </Skeleton>
  );
}
