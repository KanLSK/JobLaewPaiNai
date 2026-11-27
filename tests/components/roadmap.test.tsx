// @vitest-environment jsdom
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { RoadmapView } from "@/components/roadmap/RoadmapView";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
afterEach(cleanup);

const view = (stepId?: string) => render(<RoadmapView stepId={stepId} electives={[]} hospitals={[]} />);
const node = (id: string) => document.querySelector(`[data-step="${id}"]`) as HTMLAnchorElement;

test("every node links to its step; empty ones say so and are dashed", () => {
  view();
  expect(node("lottery").getAttribute("href")).toBe("/?step=lottery");
  expect(node("extern").textContent).toContain("รอข้อมูล");
  expect(node("extern").className).toContain("border-dashed");
  expect(node("graduate").textContent).not.toContain("รอข้อมูล");
  expect(document.querySelectorAll("[data-step]")).toHaveLength(6 + 6 + 18 + 14);
});

test("a selected step opens a labelled dialog that closes by link or Escape", () => {
  view("lottery");
  const dialog = screen.getByRole("dialog", { name: /จับฉลาก/ });
  expect(dialog.textContent).toContain("รอข้อมูล");
  const close = screen.getByRole("link", { name: "ปิด" });
  expect(close.getAttribute("href")).toBe("/");
  expect(document.activeElement).toBe(close);
  fireEvent.keyDown(window, { key: "Escape" });
  expect(push).toHaveBeenCalledWith("/", { scroll: false });
});

test("an unknown step shows the plain roadmap", () => {
  view("nonsense");
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("the pop-up sits in the middle and stops the page scrolling behind it", () => {
  const { unmount } = view("lottery");
  const dialog = screen.getByRole("dialog");
  expect(dialog.parentElement!.className).toContain("items-center");
  expect(dialog.parentElement!.className).toContain("justify-center");
  expect(dialog.className).not.toContain("right-0");
  expect(document.body.style.overflow).toBe("hidden");
  unmount();
  expect(document.body.style.overflow).toBe("");
});

test("elective branches appear only for departments that have reviews", () => {
  const electives = [{ id: "a", specialtyId: "surgery", sections: [], extra: [], overall: { label: "o", value: 5, max: 5 }, hospital: "x", wardRaw: "CVT", year: "SI130", province: null, threeWords: null }] as never;
  render(<RoadmapView electives={electives} hospitals={[]} />);
  expect(node("elective-surgery").getAttribute("href")).toBe("/?step=elective-surgery");
  expect(node("elective-ent")).toBeNull();
  expect(node("elective-other")).toBeNull();
});

test("the middle of the map follows the new flowchart", () => {
  view();
  const inside = (name: string) => [...screen.getByRole("group", { name }).querySelectorAll("[data-step]")].map((n) => n.getAttribute("data-step"));
  expect(inside("ต้นสังกัดอื่น ๆ")).toEqual(["fixed-medschool", "other-hospital", "military"]);
  expect(inside("สังกัดกระทรวงสาธารณสุข")).toEqual(["fixed-moph", "lottery"]);
  expect(inside("ไม่ใช้ทุน (จ่ายค่าปรับ)")).toEqual(["abroad"]);
  expect(screen.getByRole("group", { name: "สังกัดกระทรวงสาธารณสุข" }).textContent).toContain("ไม่สอบบอร์ด");
});

test("a step with reference material links to the guide", () => {
  view("lottery");
  expect(screen.getByRole("link", { name: /อ่านในคู่มือ/ }).getAttribute("href")).toBe("/guide#register");
});

test("a step shows its notes", () => {
  render(<RoadmapView stepId="extern" electives={[]} hospitals={[]} notes={[{ id: "n", stepId: "extern", title: "หัวข้อโน้ต", text: "เนื้อหาโน้ต" }]} />);
  const dialog = screen.getByRole("dialog");
  expect(dialog.textContent).toContain("หัวข้อโน้ต");
  expect(dialog.textContent).toContain("เนื้อหาโน้ต");
  expect(dialog.textContent).not.toContain("รอข้อมูล");
});

test.each([["extern", "/contribute/note?step=extern"], ["lottery", "/contribute/hospital?step=lottery"], ["elective", "/contribute/elective"]])(
  "an empty %s step invites a contribution only when contributing is on",
  (step, href) => {
    const { unmount } = view(step);
    expect(screen.queryByRole("link", { name: /เพิ่มข้อมูล/ })).toBeNull();
    unmount();
    render(<RoadmapView stepId={step} electives={[]} hospitals={[]} canContribute />);
    expect(screen.getByRole("link", { name: /เพิ่มข้อมูล/ }).getAttribute("href")).toBe(href);
  },
);
