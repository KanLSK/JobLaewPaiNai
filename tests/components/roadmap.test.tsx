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
