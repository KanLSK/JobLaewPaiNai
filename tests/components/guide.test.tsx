import { renderToStaticMarkup } from "react-dom/server";
import GuidePage from "@/app/(site)/guide/page";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/auth", () => ({ auth: async () => null }));

test("the guide has every section, and warns about dated or unverified material", async () => {
  const html = renderToStaticMarkup(await GuidePage());
  for (const id of ["levels", "register", "timeline", "eligibility", "university", "fixward", "scholarship", "sources"])
    expect(html).toContain(`id="${id}"`);
  expect(html).toContain("2561");
  expect(html).toContain("ยังไม่ได้ตรวจสอบ");
  expect(html).toContain("https://cpird.moph.go.th/");
});
