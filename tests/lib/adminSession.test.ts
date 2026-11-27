import { adminPassword, attemptLogin, checkPassword, makeToken, validToken } from "@/lib/admin/session";
import { memoryStore } from "@/lib/entries/memory";

vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));

const password = "correct horse battery";

test("a short or missing password turns admin off", () => {
  expect([adminPassword({}), adminPassword({ ADMIN_PASSWORD: "short" })]).toEqual([null, null]);
  expect(adminPassword({ ADMIN_PASSWORD: password })).toBe(password);
});

test("a token lasts eight hours and only for its password", () => {
  const token = makeToken(password, 0);
  const eight = 8 * 60 * 60 * 1000;
  expect(validToken(token, password, eight)).toBe(true);
  expect(validToken(token, password, eight + 1)).toBe(false);
  expect(validToken(token, "another password!", 0)).toBe(false);
  expect(validToken(token.replace(/^\d+/, String(eight * 9)), password, 0)).toBe(false);
  for (const bad of [undefined, "", "a.b", `${eight}.`]) expect(validToken(bad, password, 0)).toBe(false);
});

test("password check", () => {
  expect([checkPassword(password, password), checkPassword("", password), checkPassword(`${password} `, password)]).toEqual([true, false, false]);
});

test("after five attempts even the right password is refused", async () => {
  const rates = memoryStore();
  const attempt = (given: string, address = "a") => attemptLogin({ rates, password, address }, given);
  for (let i = 0; i < 5; i++) expect(await attempt("guess")).toBe(false);
  expect(await attempt(password)).toBe(false);
  expect(await attempt(password, "b")).toBe(true);
});
