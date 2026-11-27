import { mongoRepository } from "@/lib/data/mongoRepository";
import { memoryStore } from "@/lib/entries/memory";
import type { Status } from "@/lib/entries/types";

const add = (store: ReturnType<typeof memoryStore>, hospital: string, status: Status, at: number, importId?: string) =>
  store.insert({ kind: "elective", status, source: importId ? "import" : "form", ...(importId && { importId }), data: { hospital } as never, createdAt: new Date(at) });

test("only approved entries are served: form entries newest first, then the import in order", async () => {
  const store = memoryStore();
  await add(store, "imp-a", "approved", 0, "SI130-0");
  await add(store, "imp-b", "approved", 1, "SI130-1");
  await add(store, "pending", "pending", 5);
  await add(store, "rejected", "rejected", 6);
  const older = await add(store, "older", "approved", 10);
  const newer = await add(store, "newer", "approved", 20);
  const list = await mongoRepository(store).getElectiveReviews();
  expect(list.map((r) => [r.id, r.hospital])).toEqual([[newer, "newer"], [older, "older"], ["SI130-0", "imp-a"], ["SI130-1", "imp-b"]]);
});

test("each kind has its own list", async () => {
  const store = memoryStore();
  await store.insert({ kind: "note", status: "approved", source: "form", data: { stepId: "extern", title: "t", text: "x" }, createdAt: new Date() });
  const repository = mongoRepository(store);
  expect(await repository.getNotes()).toMatchObject([{ stepId: "extern", title: "t" }]);
  expect(await repository.getHospitalReviews()).toEqual([]);
});

test("the last good copy is served when the database stops answering", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const store = memoryStore();
  await add(store, "a", "approved", 0, "SI130-0");
  const repository = mongoRepository(store, -1);
  await repository.getElectiveReviews();
  store.list = async () => { throw new Error("down"); };
  expect((await repository.getElectiveReviews()).map((r) => r.hospital)).toEqual(["a"]);
  vi.restoreAllMocks();
});
