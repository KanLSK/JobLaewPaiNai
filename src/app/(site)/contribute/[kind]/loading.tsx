import { ContributeForm } from "@/components/contribute/ContributeForm";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { sendContribution } from "../actions";

export default function ContributeKindLoading() {
  return (
    <div className="mx-auto max-w-2xl pb-10">
      <Skeleton>
        <h1 className="mb-2 text-3xl font-bold">เพิ่มรีวิว</h1>
        <ContributeForm action={sendContribution} hospitals={[]} kind="elective" />
      </Skeleton>
    </div>
  );
}
