export const SECTIONS = {
  levels: "ระดับโรงพยาบาล",
  register: "ลงทะเบียนใช้ทุน",
  timeline: "ช่วงเวลารับสมัคร",
  university: "ม.รัฐ กับ ม.เอกชน",
  eligibility: "สิทธิ์เรียนต่อเฉพาะทาง",
  funding: "ขอทุนเรียนต่อเฉพาะทาง",
  scholarship: "ประเภททุน",
  fixward: "Fix Ward กับใช้ทุนปกติ",
  pay: "เปรียบเทียบรายได้",
  tax: "ภาษีแพทย์",
} as const;

export type SectionId = keyof typeof SECTIONS;

export interface Topic {
  id: string;
  title: string;
  about: string;
  color: string;
  sections: SectionId[];
}

export const TOPICS: Topic[] = [
  {
    id: "service",
    title: "ใช้ทุนและโรงพยาบาล",
    about: "จะไปใช้ทุนที่ไหน สมัครอย่างไร เมื่อไร",
    color: "bg-intern",
    sections: ["levels", "register", "timeline", "university"],
  },
  {
    id: "study",
    title: "เรียนต่อเฉพาะทาง",
    about: "สิทธิ์สมัคร ทุน และ Fix Ward",
    color: "bg-resident",
    sections: ["eligibility", "funding", "scholarship", "fixward"],
  },
  { id: "money", title: "รายได้และภาษี", about: "รายได้หมอจบใหม่ และการยื่นภาษี", color: "bg-graduate", sections: ["pay", "tax"] },
];

export const guideHref = (section: SectionId) => `/guide/${TOPICS.find((t) => t.sections.includes(section))!.id}#${section}`;
