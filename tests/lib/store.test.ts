import { mongoConfigured } from "@/lib/entries";
import { memoryStore } from "@/lib/entries/memory";

afterEach(() => vi.useRealTimers());

const entry = (kind: "elective" | "note", status: "pending" | "approved", at: number) => ({ kind, status, source: "form" as const, data: { stepId: "x", title: "t", text: "y" }, createdAt: new Date(at) });

test("lists by status and kind, oldest first", async () => {
  const store = memoryStore();
  const late = await store.insert(entry("note", "pending", 2));
  const early = await store.insert(entry("elective", "pending", 1));
  await store.insert(entry("note", "approved", 3));
  expect((await store.list("pending")).map((e) => e.id)).toEqual([early, late]);
  expect((await store.list("pending", "note")).map((e) => e.id)).toEqual([late]);
  expect(await store.count("pending")).toBe(2);
});

test("a missing entry is reported, not created", async () => {
  const store = memoryStore();
  expect(await store.update("nope", { status: "approved" })).toBe(false);
  expect(await store.remove("nope")).toBe(false);
  expect(await store.count("approved")).toBe(0);
});

test("hits are counted inside a window", async () => {
  vi.useFakeTimers();
  const store = memoryStore();
  expect([await store.hit("k", 1000), await store.hit("k", 1000), await store.hit("other", 1000)]).toEqual([1, 2, 1]);
  vi.advanceTimersByTime(1001);
  expect(await store.hit("k", 1000)).toBe(1);
});

test("MongoDB is on only when chosen and given an address", () => {
  expect(mongoConfigured({ DATA_SOURCE: "mongodb", MONGODB_URI: "mongodb://x" })).toBe(true);
  expect(mongoConfigured({ MONGODB_URI: "mongodb://x" })).toBe(false);
  expect(mongoConfigured({ DATA_SOURCE: "mongodb" })).toBe(false);
});
