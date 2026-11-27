// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import directory from "../../content/hospital-directory.json";
import map from "../../config/thai-map.json";
import snapshot from "../../content/reviews.json";
import { HospitalMap } from "@/components/hospitals/HospitalMap";
import { REGIONS, placeReviews, type DirectoryHospital } from "@/lib/hospitalMap";
import type { HospitalReview } from "@/lib/data/types";

const hospitals = directory as DirectoryHospital[];
const reviews = snapshot.hospitals as HospitalReview[];
afterEach(() => { cleanup(); window.history.replaceState(null, "", "/"); });

test("the directory and the map cover all six regions and every province once", () => {
  expect(hospitals).toHaveLength(105);
  expect(map.provinces).toHaveLength(77);
  expect(new Set(map.provinces.map((p) => p.name)).size).toBe(77);
  expect(REGIONS).toHaveLength(6);
  // แม่สอด is counted as north, though its province (ตาก) is western in the sheet.
  for (const h of hospitals.filter((h) => h.name !== "โรงพยาบาลแม่สอด"))
    expect(map.provinces.find((p) => p.name === h.province)?.region, h.name).toBe(h.region);
});

test("scored reviews find their hospital despite different spellings, and none are lost", () => {
  const { found, unplaced } = placeReviews(hospitals, reviews);
  const names = [...new Set(reviews.map((r) => r.hospital))];
  expect([...found.values(), ...new Set(unplaced.map((r) => r.hospital))].sort()).toEqual([...names].sort());
  expect(found.get("โรงพยาบาลพหลพลพยุหเสนา")).toBe("โรงพยาบาลพหลพลพยุหเสนา");
  expect([...found.values()]).toContain("โรงพยาบาลพระจอมเกล้า เพชรบุรี");
  expect(found.size).toBeGreaterThanOrEqual(5);
});

const view = (extra: HospitalReview[] = []) => render(<HospitalMap hospitals={hospitals} reviews={[...reviews, ...extra]} />);
const region = (name: string) => screen.getByRole("button", { name: new RegExp(`^${name} \\d+`) });
const listed = () => [...document.querySelectorAll("li > h3")].map((h) => h.textContent);

test("with no region chosen, every hospital is listed under its region", () => {
  view();
  expect(listed()).toHaveLength(105);
  expect(screen.getByRole("heading", { level: 2, name: "ทุกภาค · 105 แห่ง" })).toBeTruthy();
  for (const r of REGIONS) expect(screen.getByRole("region", { name: r.label })).toBeTruthy();
  expect(screen.getByRole("button", { name: /^ทุกภาค 105/ }).getAttribute("aria-pressed")).toBe("true");
});

test("the reader can go back to all regions", () => {
  view();
  fireEvent.click(region("ภาคใต้"));
  fireEvent.click(screen.getByRole("button", { name: /^ทุกภาค/ }));
  expect(listed()).toHaveLength(105);
  expect(window.location.search).toBe("");
});

test("choosing a region lists its hospitals by province and can be shared", () => {
  view();
  fireEvent.click(region("ภาคใต้"));
  expect(region("ภาคใต้").getAttribute("aria-pressed")).toBe("true");
  expect(listed()).toHaveLength(7);
  expect(screen.getByRole("heading", { level: 2, name: /ภาคใต้/ })).toBeTruthy();
  expect(window.location.search).toBe("?region=south");
});

test("tapping the map does the same", () => {
  view();
  fireEvent.click(document.querySelector('path[data-province="เชียงใหม่"]')!);
  expect(region("ภาคเหนือ").getAttribute("aria-pressed")).toBe("true");
  expect(listed()).toHaveLength(11);
});

test("search looks across every region, by name, province or department", () => {
  view();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "พิจิตร" } });
  expect(listed()).toEqual(["โรงพยาบาลพิจิตร"]);
  const item = document.querySelector<HTMLElement>("li > h3")!.closest("li")!;
  expect(within(item).getByText("อ่านรีวิว")).toBeTruthy();
});

test("a scored hospital links to its page, and an unknown one is still shown", () => {
  view([{ ...reviews[0], id: "new", hospital: "โรงพยาบาลที่ไม่อยู่ในรายชื่อ" }]);
  fireEvent.click(region("ภาคตะวันตก"));
  expect(screen.getAllByRole("link", { name: /ดูคะแนน/ })[0].getAttribute("href")).toContain("/hospitals/");
  const other = screen.getByRole("region", { name: "รีวิวที่ยังไม่ได้ระบุภาค" });
  expect(other.textContent).toContain("โรงพยาบาลที่ไม่อยู่ในรายชื่อ");
});

test("free text typed in the specialty column is never shown as department tags", () => {
  for (const h of hospitals) for (const s of h.specialties) expect(s.length <= 60 && !s.includes("\n"), `${h.name}: ${s.slice(0, 40)}`).toBe(true);
  const of = (name: string) => hospitals.find((h) => h.name === name)!;
  for (const name of ["โรงพยาบาลบุรีรัมย์", "โรงพยาบาลสกลนคร", "โรงพยาบาลศรีสะเกษ", "โรงพยาบาลอุบล"]) expect(of(name).review?.length, name).toBeGreaterThan(150);
  expect(of("กรมแพทย์ทหารบก").note).toContain("กองแพทย์หลวง");
  expect(of("กรมแพทย์ทหารบก").review).toContain("2 ทาง");
});

test("a short condition is shown as text and a long review is folded away", () => {
  view();
  const item = (name: string) => [...document.querySelectorAll("li > h3")].find((h) => h.textContent === name)!.closest("li")!;
  expect(item("กรมแพทย์ทหารเรือ").querySelector("p")!.textContent).toContain("กองแพทย์หลวง");
  expect(item("โรงพยาบาลบุรีรัมย์").querySelector("details")!.textContent).toContain("ขอรีวิว");
});

test("แม่สอด is listed in the north with its scored review, so no review is left unplaced", () => {
  view();
  fireEvent.click(region("ภาคเหนือ"));
  const item = [...document.querySelectorAll("li > h3")].find((h) => h.textContent === "โรงพยาบาลแม่สอด")!.closest("li")!;
  expect(within(item).getByRole("link", { name: /ดูคะแนน/ })).toBeTruthy();
  expect(screen.queryByRole("region", { name: "รีวิวที่ยังไม่ได้ระบุภาค" })).toBeNull();
});
