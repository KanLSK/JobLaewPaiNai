import { allowedDomains, isAllowedEmail, isAllowedProfile, loginRequired, safeCallback } from "@/lib/auth/allowed";

const d = allowedDomains(undefined);

test("accepts only exact student domains", () => {
  expect(isAllowedEmail("a@student.mahidol.edu", d)).toBe(true);
  expect(isAllowedEmail("a@student.mahidol.ac.th", d)).toBe(true);
  expect(isAllowedEmail("a@STUDENT.Mahidol.EDU", d)).toBe(true);
  for (const bad of ["a@student.mahidol.edu.evil.com", "a@mahidol.edu", "a@alumni.mahidol.ac.th", "a@gmail.com", "a@x@student.mahidol.edu", "@student.mahidol.edu", "", null])
    expect(isAllowedEmail(bad, d)).toBe(false);
});

test("rejects an unverified email", () => {
  expect(isAllowedProfile({ email: "a@student.mahidol.edu", email_verified: false }, d)).toBe(false);
  expect(isAllowedProfile({ email: "a@student.mahidol.edu", email_verified: true }, d)).toBe(true);
});

test("reads the domain list from the setting", () => {
  expect(allowedDomains(" Example.ac.th , ")).toEqual(["example.ac.th"]);
  expect(allowedDomains("")).toEqual(d);
});

test("login is off unless switched on", () => {
  expect(loginRequired({})).toBe(false);
  expect(loginRequired({ NODE_ENV: "production" })).toBe(false);
  expect(loginRequired({ REQUIRE_LOGIN: "0" })).toBe(false);
  expect(loginRequired({ REQUIRE_LOGIN: "1" })).toBe(true);
});

test("callback stays on this site", () => {
  for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "/\t/evil.com", undefined]) expect(safeCallback(bad)).toBe("/");
  expect(safeCallback("/?step=lottery")).toBe("/?step=lottery");
});
