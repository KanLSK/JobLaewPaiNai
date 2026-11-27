// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { ElectiveList } from "@/components/reviews/ElectiveList";

afterEach(cleanup);

test("the filters do not include student generations", () => {
  const review = (id: string, year: string) => ({ id, year, hospital: "h", wardRaw: "w", specialtyId: null, overall: { label: "o", value: 5, max: 5 }, extra: [], sections: [], threeWords: null, province: null });
  render(<ElectiveList reviews={[review("a", "SI129"), review("b", "BMSMO64")] as never} />);
  expect(screen.getAllByRole("combobox").map((s) => s.getAttribute("aria-label"))).toEqual(["โรงพยาบาล", "ภาควิชา", "เรียงตาม"]);
});
