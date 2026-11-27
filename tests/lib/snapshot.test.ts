import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileRepository, takeSnapshot } from "@/lib/data/snapshot";
import type { ReviewRepository } from "@/lib/data/repository";

const repo = {
  getElectiveReviews: async () => [{ id: "SI130-0" }, { id: "SI130-1" }],
  getHospitalReviews: async () => [{ id: "H-0" }],
} as unknown as ReviewRepository;

const tmp = () => path.join(mkdtempSync(path.join(tmpdir(), "jl-")), "reviews.json");

test("a snapshot leaves out excluded reviews", async () => {
  const snapshot = await takeSnapshot(repo, ["SI130-1", "H-0"]);
  expect(snapshot).toEqual({ electives: [{ id: "SI130-0" }], hospitals: [] });
});

test("the site reads a snapshot file on its own", async () => {
  const file = tmp();
  writeFileSync(file, JSON.stringify(await takeSnapshot(repo, [])));
  expect(await fileRepository(file).getElectiveReviews()).toHaveLength(2);
  expect(await fileRepository(file).getHospitalReviews()).toHaveLength(1);
});

test("no snapshot file means empty pages, not an error", async () => {
  expect(await fileRepository(tmp()).getElectiveReviews()).toEqual([]);
  expect(await fileRepository(tmp()).getHospitalReviews()).toEqual([]);
});

test("a broken snapshot file is an error, not silently empty", async () => {
  const file = tmp();
  writeFileSync(file, "{oops");
  await expect(fileRepository(file).getElectiveReviews()).rejects.toThrow();
});
