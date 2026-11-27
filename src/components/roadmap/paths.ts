import type { SectionId } from "@/components/guide/topics";
import { NO_SERVICE, SPECIALTIES, TRACKS, type Step } from "@/config/pathway";

/** A part of the pathway shown on its own page. */
export interface Path {
  base: string;
  title: string;
  intro: string;
  steps: Step[];
  color: string;
  guides: [string, SectionId][];
}

export const RESIDENT_PAGE: Path = {
  base: "/resident",
  title: "Resident",
  intro: "เรียนต่อแพทย์เฉพาะทาง เลือกสาขาที่สนใจ",
  steps: SPECIALTIES,
  color: "bg-resident",
  guides: [
    ["ขอทุนเรียนต่อเฉพาะทาง", "funding"],
    ["สิทธิ์เรียนต่อเฉพาะทาง", "eligibility"],
  ],
};

export const NO_SERVICE_PAGE: Path = {
  base: "/no-service",
  title: "ไม่ใช้ทุน (จ่ายค่าปรับ)",
  intro: "ชดใช้เงินแทนการใช้ทุน แล้วเลือกเส้นทางของตัวเอง",
  // แพทย์ต่างประเทศ is still a track for hospital reviews; here it is one of the four paths.
  steps: [...TRACKS.filter((t) => t.id === "abroad"), ...NO_SERVICE],
  color: "bg-intern",
  guides: [
    ["เปรียบเทียบรายได้", "pay"],
    ["ภาษีแพทย์", "tax"],
  ],
};
