// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { PathPage } from "@/components/roadmap/PathPage";
import { RoadmapView } from "@/components/roadmap/RoadmapView";
import { NO_SERVICE_PAGE, RESIDENT_PAGE } from "@/components/roadmap/paths";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
afterEach(cleanup);

const empty = { electives: [], hospitals: [], notes: [] };
const steps = () => [...document.querySelectorAll("[data-step]")].map((n) => n.getAttribute("data-step"));

test("the pathway shows every specialty at once, with nothing to open first", () => {
  render(<RoadmapView electives={[]} hospitals={[]} />);
  const resident = screen.getByRole("region", { name: "Resident" });
  expect(resident.querySelectorAll("[data-step]")).toHaveLength(1 + 18); // the heading and each specialty
  expect(resident.querySelector("button")).toBeNull();
  expect(resident.querySelector(".hidden [data-step]")).toBeNull();
  expect(screen.getByRole("link", { name: /ข้อมูลเรียนต่อ/ }).getAttribute("href")).toBe("/resident");
});

test("the pathway sends ไม่ใช้ทุน to its own page", () => {
  render(<RoadmapView electives={[]} hospitals={[]} />);
  expect(screen.getByRole("link", { name: /ดู 4 เส้นทาง/ }).getAttribute("href")).toBe("/no-service");
  for (const gone of ["abroad", "own-clinic"]) expect(steps()).not.toContain(gone);
});

test("the Resident page has the specialties and the funding guide", () => {
  render(<PathPage page={RESIDENT_PAGE} counts={{ surgery: 2 }} content={empty} />);
  expect(steps()).toHaveLength(18);
  expect(document.querySelector('[data-step="surgery"]')!.getAttribute("href")).toBe("/resident?step=surgery");
  expect(screen.getByRole("link", { name: /ขอทุนเรียนต่อ/ }).getAttribute("href")).toBe("/guide/study#funding");
});

test("the ไม่ใช้ทุน page has its four paths, pay and tax", () => {
  render(<PathPage page={NO_SERVICE_PAGE} counts={{}} content={empty} />);
  expect(steps()).toEqual(["abroad", "private-practice", "further-study", "own-clinic"]);
  for (const href of ["/guide/money#pay", "/guide/money#tax"]) expect(document.querySelector(`a[href="${href}"]`)).toBeTruthy();
});

test("a step opens on its own page and closes back to it", () => {
  render(<PathPage page={RESIDENT_PAGE} stepId="surgery" counts={{}} content={empty} />);
  expect(screen.getByRole("dialog", { name: "ศัลยศาสตร์" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "ปิด" }).getAttribute("href")).toBe("/resident");
});

test("a step from elsewhere is ignored on these pages", () => {
  render(<PathPage page={RESIDENT_PAGE} stepId="lottery" counts={{}} content={empty} />);
  expect(screen.queryByRole("dialog")).toBeNull();
});
