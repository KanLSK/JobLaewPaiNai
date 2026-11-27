import { CHANGED, destroy, saveEdit, setStatus, toForm } from "@/lib/admin/moderate";
import { buildAliases } from "@/lib/data/aliases";
import { memoryStore } from "@/lib/entries/memory";

const aliases = buildAliases([]);
const data = {
  year: "SI129", hospital: "h", wardRaw: "CVT", specialtyId: "surgery",
  overall: { label: "คะแนนภาพรวม", value: 9, max: 10 }, extra: [{ label: "ควรไป", value: 4, max: 5 }],
  sections: [{ label: "อาจารย์", text: "อ.สมชาย" }, { label: "ยาว", text: "ก".repeat(6000) }], threeWords: "a b c", province: "แพร่",
};
const seed = async () => {
  const store = memoryStore();
  const id = await store.insert({ kind: "elective", status: "pending", source: "import", importId: "SI129-0", data: data as never, createdAt: new Date() });
  return { store, id, form: toForm((await store.get(id))!) };
};

test("saving without changes changes nothing", async () => {
  const { store, id, form } = await seed();
  expect((await saveEdit(store, aliases, id, form)).ok).toBe(true);
  expect((await store.get(id))!.data).toEqual(data);
});

test("every field can be edited and scores keep their scale", async () => {
  const { store, id, form } = await seed();
  await saveEdit(store, aliases, id, { ...form, hospital: "new", year: "SI130", overall: "10", extra0: "", section0: "ลบชื่อแล้ว\r\nบรรทัดสอง", section1: "", province: "น่าน", threeWords: "" });
  expect((await store.get(id))!.data).toMatchObject({
    hospital: "new", year: "SI130", wardRaw: "CVT", specialtyId: "surgery", province: "น่าน", threeWords: null,
    overall: { value: 10, max: 10 }, extra: [{ value: null, max: 5 }], sections: [{ label: "อาจารย์", text: "ลบชื่อแล้ว\nบรรทัดสอง" }],
  });
});

test.each([["overall", "11"], ["hospital", " "], ["section0", "ก".repeat(5001)]])("refuses a bad %s", async (field, value) => {
  const { store, id, form } = await seed();
  expect(await saveEdit(store, aliases, id, { ...form, [field]: value })).toMatchObject({ ok: false, errors: { [field]: expect.any(String) } });
  expect((await store.get(id))!.data).toEqual(data);
});

test("an entry deleted elsewhere is reported and never recreated", async () => {
  const { store, id, form } = await seed();
  await destroy(store, id);
  expect(await setStatus(store, id, "approved")).toBe(false);
  expect((await saveEdit(store, aliases, id, form)).message).toBe("ไม่พบรายการนี้แล้ว");
  expect(await destroy(store, id)).toBe(false);
  expect([await store.count("pending"), await store.count("approved")]).toEqual([0, 0]);
});

test("an out-of-date screen cannot undo a redaction made elsewhere", async () => {
  const { store, id, form: stale } = await seed();
  await saveEdit(store, aliases, id, { ...stale, section0: "ลบชื่อแล้ว" });
  expect(await saveEdit(store, aliases, id, stale)).toMatchObject({ ok: false, message: CHANGED });
  expect((await store.get(id))!.data).toMatchObject({ sections: [{ text: "ลบชื่อแล้ว" }, {}] });
});

test("an entry taken down elsewhere is not republished from an out-of-date screen", async () => {
  const { store, id, form: stale } = await seed();
  await setStatus(store, id, "rejected");
  expect((await saveEdit(store, aliases, id, stale)).message).toBe(CHANGED);
});
