import { highlight } from "@/lib/admin/highlight";

test.each(["081-234-5678", "a@b.com", "Line id: abc123", "อ.สมชาย", "พญ. สมหญิง", "6401234"])("flags %s and loses nothing", (secret) => {
  const input = `ก่อน ${secret} หลัง`;
  const parts = highlight(input);
  expect(parts.map((p) => p.text).join("")).toBe(input);
  expect(parts.filter((p) => p.flagged).map((p) => p.text).join("")).toContain(secret);
});

test("ordinary text is left alone", () => {
  expect(highlight("วอร์ดดีมาก 5 คะแนน")).toEqual([{ text: "วอร์ดดีมาก 5 คะแนน", flagged: false }]);
});
