// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { Score } from "@/components/ui/Score";
import { ReviewText } from "@/components/ui/ReviewText";

afterEach(cleanup);

test("a missing score shows a dash", () => {
  const { container } = render(<Score score={{ label: "รวม", value: null, max: 5 }} />);
  expect(container.textContent).toContain("–");
  expect(container.textContent).not.toMatch(/0|NaN/);
});

test("review text stays text and wraps", () => {
  const { container } = render(<ReviewText text={"<img src=x>\n\nบรรทัดสอง"} />);
  expect(container.querySelector("img")).toBeNull();
  expect(screen.getByText(/บรรทัดสอง/).className).toContain("whitespace-pre-wrap");
  expect(screen.getByText(/บรรทัดสอง/).className).toContain("break-words");
});
