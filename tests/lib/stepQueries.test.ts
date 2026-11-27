import path from "node:path";
import { ALL_STEPS } from "@/config/pathway";
import { mongoRepository } from "@/lib/data/mongoRepository";
import { fileRepository } from "@/lib/data/snapshot";
import { memoryStore } from "@/lib/entries/memory";
import type { EntryData, Kind } from "@/lib/entries/types";
import { contentFor, countByStep } from "@/lib/stepData";

const file = fileRepository(path.join(process.cwd(), "content", "reviews.json"));
const note = { stepId: "lottery", title: "t", text: "x" };

/** The shipped reviews, in a store that records what is asked of it. */
async function setup() {
  const store = memoryStore();
  let at = 0;
  const add = (kind: Kind, { id, ...data }: { id: string }) =>
    store.insert({ kind, status: "approved", source: "import", importId: id, data: data as EntryData, createdAt: new Date(at++) });
  for (const r of await file.getElectiveReviews()) await add("elective", r);
  for (const r of await file.getHospitalReviews()) await add("hospital", r);
  await add("note", { id: "n1", ...note });
  await store.insert({ kind: "note", status: "pending", source: "form", data: note, createdAt: new Date() });
  const asked: unknown[][] = [];
  const list = store.list;
  store.list = (...args) => (asked.push(args), list(...args));
  return { repository: mongoRepository(store), asked };
}

test("counting the roadmap reads no review", async () => {
  const { repository, asked } = await setup();
  const counts = await repository.getStepCounts();
  expect(asked).toEqual([]);
  const full = countByStep(await repository.getElectiveReviews(), await repository.getHospitalReviews(), await repository.getNotes());
  expect(counts).toEqual(full);
  expect(counts.lottery).toBeGreaterThan(0);
});

test("every step gets exactly the reviews it showed before", async () => {
  const { repository } = await setup();
  const all = [await repository.getElectiveReviews(), await repository.getHospitalReviews(), await repository.getNotes()] as const;
  for (const step of ALL_STEPS) expect(await repository.getStepReviews(step.id), step.id).toEqual(contentFor(step.id, ...all));
});

test("a step asks the database only for its own reviews, and an unknown step for nothing", async () => {
  const { repository, asked } = await setup();
  await repository.getStepReviews("elective-surgery");
  expect(asked).toEqual([["approved", "elective", { specialtyId: "surgery" }], ["approved", "note", { stepId: "elective-surgery" }]]);
  asked.splice(0);
  expect(await repository.getStepReviews("nope")).toEqual({ electives: [], hospitals: [], notes: [] });
  expect(asked).toEqual([]);
});

test("hospital names come without reading reviews", async () => {
  const { repository, asked } = await setup();
  const names = await repository.getHospitalNames();
  expect(asked).toEqual([]);
  expect(names).toEqual(await file.getHospitalNames());
  expect(names.length).toBeGreaterThan(5);
});
