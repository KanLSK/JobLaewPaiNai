import { renderToStaticMarkup } from "react-dom/server";
import Home from "@/app/(site)/(home)/loading";
import Admin from "@/app/(site)/admin/loading";
import Contribute from "@/app/(site)/contribute/(chooser)/loading";
import ContributeKind from "@/app/(site)/contribute/[kind]/loading";
import Electives from "@/app/(site)/electives/loading";
import Guide from "@/app/(site)/guide/(index)/loading";
import GuideTopic from "@/app/(site)/guide/[topic]/loading";
import Hospitals from "@/app/(site)/hospitals/(list)/loading";
import Hospital from "@/app/(site)/hospitals/[name]/loading";
import Resident from "@/app/(site)/resident/loading";
import NoService from "@/app/(site)/no-service/loading";
import { SPECIALTIES, TRACKS, CAREERS, NO_SERVICE } from "@/config/pathway";

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
  for (const step of [...TRACKS.filter((t) => t.id !== "abroad"), ...SPECIALTIES, ...CAREERS]) expect(out).toContain(`data-step="${step.id}"`);
  for (const step of SPECIALTIES) expect(html(Resident)).toContain(`data-step="${step.id}"`);
  for (const step of NO_SERVICE) expect(html(NoService)).toContain(`data-step="${step.id}"`);
  expect(count(out, 'data-step="elective-')).toBe(12);
  for (const part of ['data-wire="trunk"', 'data-wire="split"', "สังกัดกระทรวงสาธารณสุข", "ต้นสังกัดอื่น ๆ", "ไม่ใช้ทุน"]) expect(out).toContain(part);
});

test("the other skeletons have the parts of their pages", () => {
  expect(count(html(Electives), "<select")).toBe(4);
  expect(count(html(Electives), "<article")).toBe(6);
  expect(count(html(Hospitals), "data-province=")).toBe(77);
  expect(count(html(Hospitals), "aria-pressed=")).toBe(7);
  expect(count(html(Hospital), "<li")).toBe(20);
  expect(count(html(Guide), 'href="/guide/')).toBe(4);
  expect(html(GuideTopic)).toContain('id="levels"');
  expect(html(Contribute).split("aspect-square").length - 1).toBe(5);
  expect(html(ContributeKind)).toContain('name="consent"');
  expect(count(html(Admin), "<article")).toBe(2);
});

test("no skeleton also covers a page below it", async () => {
  const { existsSync, readdirSync } = await import("node:fs");
  const root = "src/app/(site)";
  const files = readdirSync(root, { recursive: true }).map(String);
  for (const loading of files.filter((f) => f.endsWith("loading.tsx"))) {
    const folder = loading.slice(0, -"loading.tsx".length);
    const below = files.filter((f) => f.startsWith(folder) && f.endsWith("page.tsx") && f !== `${folder}page.tsx`);
    expect(below, loading).toEqual([]);
    expect(existsSync(`${root}/${folder}page.tsx`), loading).toBe(true);
  }
});
