import { buildAliases } from "@/lib/data/aliases";
import { memoryStore } from "@/lib/entries/memory";
import { submitEntry } from "@/lib/entries/submit";

const aliases = buildAliases([]);
const form = { step: "extern", title: "หัวข้อ", text: "เนื้อหา", consent: "on" };
const send = (store: ReturnType<typeof memoryStore>, values: Record<string, string> = form, address = "1.1.1.1") =>
  submitEntry({ store, aliases, address }, "note", values);

test("a valid submission waits for approval", async () => {
  const store = memoryStore();
  expect(await send(store, { ...form, status: "approved", importId: "SI130-0" })).toEqual({ ok: true });
  const [entry] = await store.list("pending");
  expect([entry.source, entry.importId, await store.count("approved")]).toEqual(["form", undefined, 0]);
});

test("the trap field is accepted quietly and saves nothing", async () => {
  const store = memoryStore();
  expect(await send(store, { ...form, website: "http://spam" })).toEqual({ ok: true });
  expect(await store.count("pending")).toBe(0);
});

test("ten an hour per address", async () => {
  const store = memoryStore();
  for (let i = 0; i < 10; i++) expect((await send(store)).ok).toBe(true);
  expect((await send(store)).ok).toBe(false);
  expect((await send(store, form, "2.2.2.2")).ok).toBe(true);
});

test("typos do not use up the allowance, and typed text comes back", async () => {
  const store = memoryStore();
  for (let i = 0; i < 12; i++)
    expect(await send(store, { ...form, title: "  " })).toMatchObject({ ok: false, errors: { title: expect.any(String) }, values: { text: "เนื้อหา" } });
  expect((await send(store)).ok).toBe(true);
});

test("a full queue is refused", async () => {
  const store = memoryStore();
  store.count = async () => 200;
  expect(await send(store)).toMatchObject({ ok: false, values: { title: "หัวข้อ" } });
});

test("a database failure is reported and keeps the text", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const store = memoryStore();
  store.insert = async () => { throw new Error("down"); };
  expect(await send(store)).toMatchObject({ ok: false, message: expect.any(String), values: { text: "เนื้อหา" } });
  vi.restoreAllMocks();
});
