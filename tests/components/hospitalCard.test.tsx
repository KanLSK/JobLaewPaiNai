// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { HospitalCard } from "@/components/reviews/HospitalCard";
import type { HospitalReview } from "@/lib/data/types";

afterEach(cleanup);

const review: HospitalReview = {
  id: "H-0", hospital: "โรงพยาบาลตัวอย่าง", summary: "บรรทัดหนึ่ง\n\nบรรทัดสอง", trackId: null, trackRaw: "", specialtyId: null, departmentRaw: "",
  scores: [{ label: "รวม", value: 4, max: 5 }],
};

test("fills its slot, clamps long text and links to the rest", () => {
  const { container } = render(<HospitalCard review={review} />);
  expect(container.querySelector("article")!.className).toContain("h-full");
  expect(screen.getByText(/บรรทัดหนึ่ง/).className).toContain("line-clamp-3");
  expect(screen.getByRole("link", { name: /ดูรีวิวและคะแนนทั้งหมด/ }).getAttribute("href")).toContain("/hospitals/");
  expect(container.querySelector("details")).toBeNull();
});

test("says when there is no written review", () => {
  render(<HospitalCard review={{ ...review, summary: null }} />);
  expect(screen.getByText("ยังไม่มีรีวิวภาพรวม")).toBeTruthy();
});
