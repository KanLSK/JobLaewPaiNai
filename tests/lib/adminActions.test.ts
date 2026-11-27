import { moderate } from "@/app/(site)/admin/actions";
import { toForm } from "@/lib/admin/moderate";
import { makeToken } from "@/lib/admin/session";
import { memoryStore } from "@/lib/entries/memory";

const password = "correct horse battery";
let cookie: string | undefined;
let store = memoryStore();
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => (cookie ? { value: cookie } : undefined) }), headers: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (to: string) => { throw new Error(`redirect:${to}`); } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/entries", () => ({ getStore: () => store, mongoConfigured: () => true }));

beforeEach(() => { store = memoryStore(); cookie = undefined; vi.stubEnv("ADMIN_PASSWORD", password); });
afterEach(() => vi.unstubAllEnvs());

const seed = async () => {
  const id = await store.insert({ kind: "note", status: "pending", source: "form", data: { stepId: "extern", title: "t", text: "โทร 081-234-5678" }, createdAt: new Date() });
  return { id, entry: (await store.get(id))! };
};
const post = (values: Record<string, string>) => {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return moderate(null, form);
};

test.each(["save", "approve", "reject", "unpublish", "delete"])("%s is refused without the password", async (intent) => {
  const { id, entry } = await seed();
  await expect(post({ ...toForm(entry), id, intent, text: "changed" })).rejects.toThrow("Not signed in");
  expect(await store.get(id)).toEqual(entry);
});

test("approve publishes what is on screen, not what was there before", async () => {
  cookie = makeToken(password);
  const { id, entry } = await seed();
  await expect(post({ ...toForm(entry), id, intent: "approve", text: "ลบเบอร์แล้ว" })).rejects.toThrow("redirect:/admin?tab=pending&done=approved");
  expect(await store.get(id)).toMatchObject({ status: "approved", data: { text: "ลบเบอร์แล้ว" } });
});

test("a bad edit blocks approval", async () => {
  cookie = makeToken(password);
  const { id, entry } = await seed();
  expect(await post({ ...toForm(entry), id, intent: "approve", title: "" })).toMatchObject({ ok: false, errors: { title: expect.any(String) } });
  expect((await store.get(id))!.status).toBe("pending");
});

test("unpublishing works whatever is typed", async () => {
  cookie = makeToken(password);
  const { id, entry } = await seed();
  await store.update(id, { status: "approved" });
  await expect(post({ ...toForm(entry), id, intent: "unpublish", title: "" })).rejects.toThrow("done=unpublished");
  expect((await store.get(id))!.status).toBe("rejected");
});
