import { renderToStaticMarkup } from "react-dom/server";
import SiteLayout from "@/app/(site)/layout";
import SignInPage from "@/app/signin/page";

const redirect = vi.fn((to: string) => { throw new Error(`redirect:${to}`); });
vi.mock("next/navigation", () => ({ redirect: (to: string) => redirect(to) }));
vi.mock("@/auth", () => ({ auth: async () => ({ user: { email: "a@student.mahidol.edu" } }), signIn: vi.fn(), signOut: vi.fn() }));
afterEach(() => vi.unstubAllEnvs());

const layout = async () => renderToStaticMarkup(await SiteLayout({ children: null }));

test("with login off there is no sign-out button and no sign-in page", async () => {
  expect(await layout()).not.toContain("ออกจากระบบ");
  await expect(SignInPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("redirect:/");
});

test("switching login on brings both back", async () => {
  vi.stubEnv("REQUIRE_LOGIN", "1");
  expect(await layout()).toContain("ออกจากระบบ");
  expect(renderToStaticMarkup(await SignInPage({ searchParams: Promise.resolve({}) }))).toContain("Google");
});
