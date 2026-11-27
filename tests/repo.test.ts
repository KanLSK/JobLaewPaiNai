import { execFileSync } from "node:child_process";

const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" }).trim();

test("no source file is hidden from git", () => {
  expect(git("ls-files", "--others", "--ignored", "--exclude-standard", "--", "src", "tests", "config")).toBe("");
});

test("the private Data folder stays ignored", () => {
  expect(git("check-ignore", "Data/anything.csv")).toBe("Data/anything.csv");
});
