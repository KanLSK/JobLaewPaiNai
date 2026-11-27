import { renderToStaticMarkup } from "react-dom/server";
import SiteLayout from "@/app/(site)/layout";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/auth", () => ({ auth: async () => null, signOut: vi.fn() }));

test("income and tax has its own button in the top menu", async () => {
  const html = renderToStaticMarkup(await SiteLayout({ children: null }));
  expect(html).toMatch(/<a[^>]*href="\/guide\/money"[^>]*>รายได้และภาษี<\/a>/);
});
