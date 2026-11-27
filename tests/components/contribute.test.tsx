// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import ContributePage from "@/app/(site)/contribute/(chooser)/page";
import ContributeKindPage from "@/app/(site)/contribute/[kind]/page";
import { ContributeForm } from "@/components/contribute/ContributeForm";

vi.mock("next/navigation", () => ({
  redirect: (to: string) => { throw new Error(`redirect:${to}`); },
  notFound: () => { throw new Error("notFound"); },
}));
vi.mock("next/headers", () => ({ headers: vi.fn(), cookies: vi.fn() }));
vi.mock("@/auth", () => ({ auth: async () => null }));
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

const configured = () => { vi.stubEnv("DATA_SOURCE", "mongodb"); vi.stubEnv("MONGODB_URI", "mongodb://unused"); };
const chooser = async (query: Record<string, string> = {}) => renderToStaticMarkup(await ContributePage({ searchParams: Promise.resolve(query) }));
const form = (kind: "elective" | "hospital" | "note", step?: string) =>
  render(<ContributeForm action={async () => null} hospitals={["ศิริราช"]} topic={kind} initialStep={step} />);

test("the pages say so while the database is not set up", async () => {
  vi.stubEnv("DATA_SOURCE", "");
  expect(await chooser()).toContain("ยังไม่เปิดใช้งาน");
  const out = await ContributeKindPage({ params: Promise.resolve({ kind: "note" }), searchParams: Promise.resolve({}) });
  expect(renderToStaticMarkup(out)).toContain("ยังไม่เปิดใช้งาน");
});

test("the first page is five big choices with pictures, and no form", async () => {
  configured();
  const out = await chooser();
  for (const kind of ["elective", "hospital", "extern", "resident", "note"]) expect(out).toContain(`href="/contribute/${kind}"`);
  expect(out.split("<svg").length - 1).toBe(5);
  expect(out).toContain("aspect-square");
  expect(out).not.toContain("<form");
});

test("old links with ?kind= still arrive at the form", async () => {
  configured();
  await expect(chooser({ kind: "hospital", step: "lottery" })).rejects.toThrow("redirect:/contribute/hospital?step=lottery");
});

test("an unknown kind is not a page", async () => {
  await expect(ContributeKindPage({ params: Promise.resolve({ kind: "nope" }), searchParams: Promise.resolve({}) })).rejects.toThrow("notFound");
});

test("each form has its own fields, consent and hospital suggestions", () => {
  form("elective");
  expect(screen.getByText(/ไม่มีชื่อบุคคล เบอร์ติดต่อ หรือข้อมูลผู้ป่วย/)).toBeTruthy();
  const hospital = screen.getByRole("combobox", { name: /โรงพยาบาล/ }) as HTMLInputElement;
  expect(hospital.required).toBe(true);
  expect(document.getElementById(hospital.getAttribute("list")!)!.innerHTML).toContain("ศิริราช");
  expect(screen.queryByRole("combobox", { name: /Track/ })).toBeNull();
});

test("a link from the roadmap preselects the step", () => {
  form("hospital", "lottery");
  expect((screen.getByRole("combobox", { name: /Track/ }) as HTMLSelectElement).value).toBe("lottery");
});

test("going back to the choices asks first only if something was typed", () => {
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  form("note");
  const back = screen.getByRole("link", { name: /เลือกประเภทอื่น/ });
  expect(back.getAttribute("href")).toBe("/contribute");
  back.addEventListener("click", (e) => e.preventDefault()); // jsdom cannot navigate
  fireEvent.click(back);
  expect(confirm).not.toHaveBeenCalled();
  fireEvent.input(screen.getByRole("textbox", { name: "หัวข้อ" }), { target: { value: "x" } });
  expect(fireEvent.click(back)).toBe(false);
  expect(confirm).toHaveBeenCalledOnce();
});

const page = async (kind: string, step?: string) =>
  render(<>{await ContributeKindPage({ params: Promise.resolve({ kind }), searchParams: Promise.resolve(step ? { step } : {}) })}</>);
const options = () => [...(screen.getByRole("combobox") as HTMLSelectElement).options].map((o) => o.value).filter(Boolean);
const hidden = (name: string) => (document.querySelector(`input[type="hidden"][name="${name}"]`) as HTMLInputElement | null)?.value;

test("Extern has its own form with nothing to choose", async () => {
  configured();
  await page("extern");
  expect(screen.queryByRole("combobox")).toBeNull();
  expect([hidden("kind"), hidden("step")]).toEqual(["note", "extern"]);
  expect(screen.getByRole("heading", { name: "Extern" })).toBeTruthy();
});

test("Resident has its own form listing only Resident and its specialties", async () => {
  configured();
  await page("resident", "surgery");
  expect(options()).toHaveLength(19);
  expect(options()).toContain("resident");
  expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("surgery");
  expect(hidden("kind")).toBe("note");
});

test("the other-path form no longer offers Extern or Resident", async () => {
  configured();
  await page("note");
  for (const gone of ["extern", "resident", "surgery"]) expect(options()).not.toContain(gone);
  for (const kept of ["graduate", "own-clinic", "research"]) expect(options()).toContain(kept);
});

test.each([["extern", "/contribute/extern"], ["surgery", "/contribute/resident?step=surgery"]])("an old link for %s goes to its new form", async (step, to) => {
  configured();
  await expect(ContributeKindPage({ params: Promise.resolve({ kind: "note" }), searchParams: Promise.resolve({ step }) })).rejects.toThrow(`redirect:${to}`);
});
