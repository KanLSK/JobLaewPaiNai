import { PathPage } from "@/components/roadmap/PathPage";
import { NO_SERVICE_PAGE } from "@/components/roadmap/paths";
import { Skeleton } from "@/components/skeleton/Skeleton";

export default function NoServiceLoading() {
  return (
    <Skeleton>
      <PathPage page={NO_SERVICE_PAGE} counts={{}} content={{ electives: [], hospitals: [], notes: [] }} />
    </Skeleton>
  );
}
