// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import ContributePage from "@/app/(site)/contribute/page";
import { ContributeForm } from "@/components/contribute/ContributeForm";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn(), cookies: vi.fn() }));
vi.mock("@/auth", () => ({ auth: async () => null }));
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

test("the page says so while the database is not set up", async () => {
  vi.stubEnv("DATA_SOURCE", "");
  expect(renderToStaticMarkup(await ContributePage({ searchParams: Promise.resolve({}) }))).toContain("ยังไม่เปิดใช้งาน");
});

test("three forms, a consent box, and hospital suggestions", () => {
  render(<ContributeForm action={async () => null} hospitals={["ศิริราช"]} initialKind="elective" />);
  for (const tab of ["Elective", "โรงพยาบาลใช้ทุน", "เส้นทางอื่น"]) expect(screen.getByRole("button", { name: tab })).toBeTruthy();
  expect(screen.getAllByText(/ไม่มีชื่อบุคคล เบอร์ติดต่อ หรือข้อมูลผู้ป่วย/)).toHaveLength(3); // one per form
  const hospital = screen.getByRole("combobox", { name: /โรงพยาบาล/ }) as HTMLInputElement;
  expect(hospital.required).toBe(true);
  expect(document.getElementById(hospital.getAttribute("list")!)!.innerHTML).toContain("ศิริราช");
  fireEvent.click(screen.getByRole("button", { name: "เส้นทางอื่น" }));
  expect(screen.getByRole("combobox", { name: /เส้นทาง/ })).toBeTruthy();
});

test("a link from the roadmap preselects the step", () => {
  render(<ContributeForm action={async () => null} hospitals={[]} initialKind="hospital" initialStep="lottery" />);
  expect((screen.getByRole("combobox", { name: /Track/ }) as HTMLSelectElement).value).toBe("lottery");
});

test("typed text survives a look at another tab", () => {
  render(<ContributeForm action={async () => null} hospitals={[]} initialKind="elective" />);
  const review = () => screen.getByRole("textbox", { name: "รีวิว Elective" }) as HTMLTextAreaElement;
  fireEvent.change(review(), { target: { value: "เขียนยาวมาก" } });
  fireEvent.click(screen.getByRole("button", { name: "เส้นทางอื่น" }));
  fireEvent.click(screen.getByRole("button", { name: "Elective" }));
  expect(review().value).toBe("เขียนยาวมาก");
});
