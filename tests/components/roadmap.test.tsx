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
