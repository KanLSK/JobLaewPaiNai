import { renderToStaticMarkup } from "react-dom/server";
import Home from "@/app/(site)/loading";
import Admin from "@/app/(site)/admin/loading";
import Contribute from "@/app/(site)/contribute/loading";
import Electives from "@/app/(site)/electives/loading";
import Guide from "@/app/(site)/guide/loading";
import Hospitals from "@/app/(site)/hospitals/loading";
import Hospital from "@/app/(site)/hospitals/[name]/loading";

test.each([
  ["pathway", Home, "จบแล้วไปไหน?"],
  ["electives", Electives, "รีวิว Elective"],
  ["hospitals", Hospitals, "โรงพยาบาลใช้ทุน"],
  ["one hospital", Hospital, "โรงพยาบาลใช้ทุน"],
  ["guide", Guide, "คู่มือ"],
  ["contribute", Contribute, "เพิ่มรีวิว"],
  ["admin", Admin, "ผู้ดูแล"],
] as const)("the %s page says it is loading, under its own heading", (_, Loading, title) => {
  const html = renderToStaticMarkup(<Loading />);
  expect(html).toContain('role="status"');
  expect(html).toContain("กำลังโหลด");
  expect(html).toContain(`>${title}</h1>`);
  expect(html).toContain("animate-pulse");
});
