import { cached } from "@/lib/data/cache";
import { approveAllEnabled, createRepository } from "@/lib/data/repository";
import type { TableSource } from "@/lib/data/types";

test("loads once within the TTL and again after it", async () => {
  let time = 0, calls = 0;
  const get = cached(async () => ++calls, 100, () => time);
  expect([await get(), await get()]).toEqual([1, 1]);
  time = 101;
  expect(await get()).toBe(2);
});

test("keeps the last good value when a reload fails, but rejects a first failure", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  let time = 0, fail = false;
  const get = cached(async () => { if (fail) throw new Error("down"); return "good"; }, 100, () => time);
  await get();
  fail = true;
  time = 101;
  expect(await get()).toBe("good");
  await expect(cached(async () => { throw new Error("down"); }, 100)()).rejects.toThrow("down");
  vi.restoreAllMocks();
});

const source: TableSource = {
  async readTable(table) {
    if (table === "si130") return [{ hospital: "x", approved: "" }];
    return [];
  },
};

test("approveAll shows unmarked rows, otherwise they stay hidden", async () => {
  expect(await createRepository(source).getElectiveReviews()).toHaveLength(0);
  expect(await createRepository(source, { approveAll: true }).getElectiveReviews()).toHaveLength(1);
});

test("approveAll only in development with csv", () => {
  const on = { DATA_SOURCE: "csv", DEV_APPROVE_ALL: "1" };
  expect(approveAllEnabled({ ...on, NODE_ENV: "development" })).toBe(true);
  expect(approveAllEnabled({ ...on, NODE_ENV: "production" })).toBe(false);
  expect(approveAllEnabled({ ...on, NODE_ENV: "development", DATA_SOURCE: "sheets" })).toBe(false);
});
