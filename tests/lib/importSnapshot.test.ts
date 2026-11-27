import { importSnapshot } from "@/lib/entries/importSnapshot";
import { memoryStore } from "@/lib/entries/memory";

const snapshot = { electives: [{ id: "SI130-0", hospital: "a" }, { id: "SI130-1", hospital: "b" }], hospitals: [{ id: "H-0", hospital: "c" }] } as any;

test("import is repeatable, keeps edits and deletions", async () => {
  const store = memoryStore();
  expect(await importSnapshot(store, snapshot)).toEqual({ added: 3, skipped: 0 });
  const [first, second, third] = await store.list("approved");
  expect([first.importId, third.kind, first.kind]).toEqual(["SI130-0", "hospital", "elective"]);
  expect(first.data).not.toHaveProperty("id");
  await store.update(first.id, { data: { ...first.data, hospital: "edited" } as any });
  await store.remove(second.id);
  expect(await importSnapshot(store, snapshot)).toEqual({ added: 0, skipped: 3 });
  const after = await store.list("approved");
  expect(after.map((e) => (e.data as any).hospital)).toEqual(["edited", "c"]);
  expect(await store.get(second.id)).toBeNull();
});
