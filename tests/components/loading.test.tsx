import { renderToStaticMarkup } from "react-dom/server";
import Home from "@/app/(site)/(home)/loading";
import Admin from "@/app/(site)/admin/loading";
import Contribute from "@/app/(site)/contribute/loading";
import Electives from "@/app/(site)/electives/loading";
import Guide from "@/app/(site)/guide/loading";
import Hospitals from "@/app/(site)/hospitals/loading";
import Hospital from "@/app/(site)/hospitals/[name]/loading";
import { SPECIALTIES, TRACKS, CAREERS } from "@/config/pathway";

vi.mock("next/navigation", () => ({ redirect: vi.fn(), useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/headers", () => ({ headers: vi.fn(), cookies: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/auth", () => ({ auth: async () => null }));

const html = (Loading: () => React.ReactNode) => renderToStaticMarkup(<>{Loading()}</>);
const count = (text: string, part: string) => text.split(part).length - 1;

test.each([
  ["pathway", Home, "จบแล้วไปไหน?"],
  ["electives", Electives, "รีวิว Elective"],
  ["hospitals", Hospitals, "โรงพยาบาลใช้ทุน"],
  ["one hospital", Hospital, null],
  ["guide", Guide, "คู่มือ"],
  ["contribute", Contribute, "เพิ่มรีวิว"],
  ["admin", Admin, "ผู้ดูแล"],
] as const)("the %s skeleton announces itself and cannot be used", (_, Loading, title) => {
  const out = html(Loading);
  expect(out).toContain('role="status"');
  expect(out).toContain("กำลังโหลด");
  expect(out).toContain("inert");
  expect(out).toContain("skeleton");
  if (title) expect(out).toContain(`>${title}</h1>`);
});

test("the pathway skeleton has every branch of the map", () => {
  const out = html(Home);
  for (const step of [...TRACKS, ...SPECIALTIES, ...CAREERS]) expect(out).toContain(`data-step="${step.id}"`);
  expect(count(out, 'data-step="elective-')).toBe(12);
  for (const part of ['data-wire="trunk"', 'data-wire="split"', "สังกัดกระทรวงสาธารณสุข", "ต้นสังกัดอื่น ๆ", "ไม่ใช้ทุน"]) expect(out).toContain(part);
});

test("the other skeletons have the parts of their pages", () => {
  expect(count(html(Electives), "<select")).toBe(4);
  expect(count(html(Electives), "<article")).toBe(6);
  expect(count(html(Hospitals), "<select")).toBe(2);
  expect(count(html(Hospitals), "<article")).toBe(6);
  expect(count(html(Hospital), "<li")).toBe(20);
  for (const id of ["levels", "register", "timeline", "eligibility", "sources"]) expect(html(Guide)).toContain(`id="${id}"`);
  expect(html(Contribute)).toContain('name="consent"');
  expect(count(html(Admin), "<article")).toBe(2);
});

test("the pathway skeleton belongs to the pathway page only", async () => {
  const { existsSync } = await import("node:fs");
  expect(existsSync("src/app/(site)/loading.tsx")).toBe(false);
  expect(existsSync("src/app/(site)/(home)/page.tsx")).toBe(true);
});
