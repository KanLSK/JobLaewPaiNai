// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import QuizResultPage from "@/app/(site)/guide/quiz/[result]/page";
import { GuideIndex } from "@/components/guide/GuideContent";
import { NODES, RESULTS, START } from "@/components/quiz/data";
import { Quiz } from "@/components/quiz/Quiz";
import { SPECIALTIES } from "@/config/pathway";

const getStepReviews = vi.fn(async (stepId: string) => ({
  electives: [],
  hospitals: [],
  notes: stepId === "surgery" ? [{ id: "n1", stepId, title: "ปีแรกในห้องผ่าตัด", text: "ยืนนานมาก" }] : [],
}));
vi.mock("@/lib/data/repository", () => ({ getRepository: () => ({ getStepReviews }) }));
vi.mock("@/auth", () => ({ auth: async () => null }));
vi.mock("next/navigation", () => ({ redirect: vi.fn(), notFound: () => { throw new Error("notFound"); } }));

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

const answer = (text: RegExp) => fireEvent.click(screen.getByRole("button", { name: text }));
const question = () => screen.getByRole("heading", { level: 2 }).textContent;
/** Picks the answer that leads to this node. */
const go = (from: string, to: string) => fireEvent.click(screen.getByRole("button", { name: NODES[from].answers.find((a) => a.to === to)!.label }));
const page = async (result: string) => render(<>{await QuizResultPage({ params: Promise.resolve({ result }) })}</>);

test("every answer leads somewhere, and every question and result can be reached", () => {
  const seen = new Set<string>();
  const walk = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    if (RESULTS[id]) return;
    expect(NODES[id], id).toBeTruthy();
    NODES[id].answers.forEach((a) => walk(a.to));
  };
  walk(START);
  expect([...seen].sort()).toEqual([...Object.keys(NODES), ...Object.keys(RESULTS)].sort());
});

test("all eighteen specialties can be the answer", () => {
  expect(new Set(Object.values(RESULTS).flatMap((r) => r.specialties)).size).toBe(SPECIALTIES.length);
});

test("the guide's front page leads to the quiz", () => {
  render(<GuideIndex />);
  expect(screen.getByRole("link", { name: /เรียนต่ออะไรดี/ }).getAttribute("href")).toBe("/guide/quiz");
});

test("answering walks the flowchart, one question at a time, to a result link", () => {
  render(<Quiz />);
  expect(question()).toBe(NODES.hardship.question);
  go("hardship", "why");
  go("why", "rich");
  go("rich", "time");
  const last = NODES.time.answers.find((a) => a.to === "surgery")!.label;
  expect(screen.getByRole("link", { name: last }).getAttribute("href")).toBe("/guide/quiz/surgery");
});

test("the last answer can be undone, and the quiz restarted", () => {
  render(<Quiz />);
  expect(screen.queryByRole("button", { name: /ย้อนกลับ/ })).toBeNull();
  go("hardship", "why");
  go("why", "rich");
  answer(/ย้อนกลับ/);
  expect(question()).toBe(NODES.why.question);
  answer(/เริ่มใหม่/);
  expect(question()).toBe(NODES.hardship.question);
});

test("a result shows the resident reviews of its specialty", async () => {
  await page("surgery");
  expect(screen.getByText("ปีแรกในห้องผ่าตัด")).toBeTruthy();
  expect(screen.getByRole("link", { name: /เล่นอีกรอบ/ }).getAttribute("href")).toBe("/guide/quiz");
});

test("a specialty with no reviews says so, and invites one when contributing is on", async () => {
  vi.stubEnv("DATA_SOURCE", "mongodb");
  vi.stubEnv("MONGODB_URI", "mongodb://example.invalid");
  vi.stubEnv("ADMIN_PASSWORD", "x".repeat(20));
  await page("pretty");
  expect(screen.getAllByText("ยังไม่มีรีวิว")).toHaveLength(3);
  expect(screen.getAllByRole("link", { name: /เขียนรีวิว/ })[0].getAttribute("href")).toBe("/contribute/resident?step=ophthalmology");
});

test("an unknown result is not a page", async () => {
  await expect(page("astronaut")).rejects.toThrow("notFound");
});
