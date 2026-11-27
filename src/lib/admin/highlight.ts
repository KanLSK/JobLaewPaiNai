/** Likely contact details and names. An aid for the reader, not a guarantee. */
const SENSITIVE = new RegExp(
  [
    "[\\w.+-]+@[\\w-]+\\.[\\w.]+", // email
    "0\\d{1,2}[-\\s]?\\d{3}[-\\s]?\\d{3,4}", // phone
    "(?:line|ไลน์)\\s*(?:id|ไอดี)?\\s*[:：]?\\s*@?[\\w.-]{3,}",
    "(?:อาจารย์|อ\\.|นพ\\.|พญ\\.|นายแพทย์|แพทย์หญิง|หมอ|พี่)\\s*[ก-๙A-Za-z]+",
    "\\d{7,}", // student id and the like
  ].join("|"),
  "gi",
);

export function highlight(text: string): { text: string; flagged: boolean }[] {
  const parts: { text: string; flagged: boolean }[] = [];
  let end = 0;
  for (const match of text.matchAll(SENSITIVE)) {
    if (match.index > end) parts.push({ text: text.slice(end, match.index), flagged: false });
    parts.push({ text: match[0], flagged: true });
    end = match.index + match[0].length;
  }
  if (end < text.length) parts.push({ text: text.slice(end), flagged: false });
  return parts;
}
