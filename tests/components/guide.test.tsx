import { renderToStaticMarkup } from "react-dom/server";
import GuideIndex from "@/app/(site)/guide/(index)/page";
import GuideTopic from "@/app/(site)/guide/[topic]/page";
import { SECTIONS, TOPICS, guideHref } from "@/components/guide/topics";

vi.mock("next/navigation", () => ({ redirect: vi.fn(), notFound: () => { throw new Error("notFound"); } }));
vi.mock("@/auth", () => ({ auth: async () => null }));

const index = async () => renderToStaticMarkup(await GuideIndex());
const topic = async (id: string) => renderToStaticMarkup(await GuideTopic({ params: Promise.resolve({ topic: id }) }));

test("the front page only offers the topics and sources", async () => {
  const html = await index();
  for (const { id, title } of TOPICS) {
    expect(html).toContain(`href="/guide/${id}"`);
    expect(html).toContain(title);
  }
  expect(html).toContain("https://cpird.moph.go.th/");
  expect(html).not.toContain("<details");
});

test("every section is on exactly one topic page", async () => {
  const pages = await Promise.all(TOPICS.map((t) => topic(t.id)));
  for (const section of Object.keys(SECTIONS)) expect(pages.filter((html) => html.includes(`id="${section}"`)), section).toHaveLength(1);
});

test("topic pages keep their warnings and credit, and lead to the other topics", async () => {
  expect(await topic("service")).toContain("2561");
  expect(await topic("service")).toContain("ยังไม่ได้ตรวจสอบ");
  const money = await topic("money");
  expect(money).toContain("ตัวเลขประมาณ");
  expect(money).toContain("หมอยุ่งอยากมีเวลา");
  for (const other of ["/guide", "/guide/service", "/guide/study"]) expect(money).toContain(`href="${other}"`);
});

test("links from elsewhere point at the right page and section", () => {
  expect([guideHref("register"), guideHref("funding"), guideHref("tax")]).toEqual(["/guide/service#register", "/guide/study#funding", "/guide/money#tax"]);
});

test("an unknown topic is not a page", async () => {
  await expect(topic("nope")).rejects.toThrow("notFound");
});
