// @vitest-environment jsdom
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { ElectiveCards } from "@/components/reviews/ElectiveCards";
import type { ElectiveReview } from "@/lib/data/types";

afterEach(cleanup);

const review: ElectiveReview = {
  id: "SI130-0", year: "SI130", hospital: "โรงพยาบาลตัวอย่าง", wardRaw: "วอร์ดตัวอย่าง", specialtyId: null,
  overall: { label: "ความพึงพอใจในภาพรวม", value: 5, max: 5 }, extra: [{ label: "ความชิล", value: 4, max: 5 }],
  sections: [{ label: "รีวิว Elective", text: "ย่อหน้าหนึ่ง\n\n\n\nย่อหน้าสอง" }, { label: "ฝากถึงน้องๆ", text: "ข้อความฝาก" }],
  threeWords: "ดี มาก เลย", province: null,
};
const open = () => fireEvent.click(screen.getByRole("button", { name: /อ่านรีวิวเต็ม/ }));

test("the card is a fixed-shape preview", () => {
  const { container } = render(<ElectiveCards reviews={[review]} />);
  expect(container.querySelector("article")!.className).toContain("h-full");
  expect(screen.getByText(/ย่อหน้าหนึ่ง/).className).toContain("line-clamp-3");
  expect(container.textContent).not.toContain("ข้อความฝาก");
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("the full review opens with every part under its heading, extra blank lines removed", () => {
  render(<ElectiveCards reviews={[review]} />);
  open();
  const reader = screen.getByRole("dialog", { name: /วอร์ดตัวอย่าง/ });
  for (const heading of ["รีวิว Elective", "ฝากถึงน้องๆ"]) expect(within(reader).getByRole("heading", { name: heading })).toBeTruthy();
  expect(within(reader).getByText(/ย่อหน้าหนึ่ง/).textContent).toBe("ย่อหน้าหนึ่ง\n\nย่อหน้าสอง");
  expect(reader.textContent).toContain("ข้อความฝาก");
  expect(reader.textContent).toContain("ดี มาก เลย");
  expect(document.body.style.overflow).toBe("hidden");
});

test("closing returns to the card", () => {
  render(<ElectiveCards reviews={[review]} />);
  open();
  fireEvent.click(screen.getByRole("button", { name: "ปิด" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement?.textContent).toContain("อ่านรีวิวเต็ม");
  expect(document.body.style.overflow).toBe("");
});

test("inside a step pop-up, Escape goes back one level only", () => {
  const outer = vi.fn();
  window.addEventListener("keydown", outer);
  render(<ElectiveCards reviews={[review]} closeAllHref="/" />);
  open();
  expect(screen.getByRole("link", { name: "ปิด" }).getAttribute("href")).toBe("/");
  expect(screen.getByRole("button", { name: /กลับ/ })).toBeTruthy();
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(outer).not.toHaveBeenCalled();
  window.removeEventListener("keydown", outer);
});
