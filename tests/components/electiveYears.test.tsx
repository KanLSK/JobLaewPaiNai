// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { ElectiveList } from "@/components/reviews/ElectiveList";

afterEach(cleanup);

test("the year filter offers the years that exist, newest first", () => {
  const review = (id: string, year: string) => ({ id, year, hospital: "h", wardRaw: "w", specialtyId: null, overall: { label: "o", value: 5, max: 5 }, extra: [], sections: [], threeWords: null, province: null });
  render(<ElectiveList reviews={[review("a", "SI129"), review("b", "SI131")] as never} />);
  const select = screen.getByRole("combobox", { name: /รุ่น/ }) as HTMLSelectElement;
  expect([...select.options].map((o) => o.value)).toEqual(["", "SI131", "SI129"]);
});
