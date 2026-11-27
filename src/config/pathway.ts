export type StageId = "elective" | "extern" | "graduate" | "intern" | "resident" | "other";

export interface Step {
  id: string;
  label: string;
  stage: StageId;
  parentId: string | null;
}

const stage = (id: StageId, label: string): Step => ({ id, label, stage: id, parentId: null });
const children = (parent: StageId, entries: [string, string][]): Step[] =>
  entries.map(([id, label]) => ({ id, label, stage: parent, parentId: parent }));

export const STAGES: Step[] = [
  stage("elective", "Elective"),
  stage("extern", "Extern"),
  stage("graduate", "จบแล้วไปไหน?"),
  stage("intern", "ใช้ทุน / Intern"),
  stage("resident", "Resident"),
  stage("other", "เส้นทางอื่น"),
];

export const TRACKS: Step[] = children("intern", [
  ["lottery", "จับฉลากใช้ทุน สังกัดกระทรวงสาธารณสุข"],
  ["fixed-moph", "Fixed Ward สังกัดกระทรวงสาธารณสุข (Fixed ไม่สอบบอร์ด / Fixed สอบบอร์ด)"],
  ["fixed-medschool", "Fixed Ward สังกัดโรงเรียนแพทย์ / โรงพยาบาลสังกัดโรงเรียนแพทย์"],
  ["other-hospital", "แพทย์โรงพยาบาลอื่น ๆ (Fixed Ward โรงพยาบาลอื่น ๆ ที่ไม่ได้สังกัด สธ. และ รรพ.)"],
  ["military", "แพทย์ทหาร"],
  ["abroad", "แพทย์ต่างประเทศ"],
]);

export const SPECIALTIES: Step[] = children("resident", [
  ["pediatrics", "กุมารเวชศาสตร์"],
  ["ophthalmology", "จักษุวิทยา"],
  ["psychiatry", "จิตเวชศาสตร์"],
  ["dermatology", "ตจวิทยา"],
  ["forensic", "นิติเวชศาสตร์"],
  ["pathology", "พยาธิวิทยา"],
  ["clinical-pathology", "พยาธิวิทยาคลินิก"],
  ["radiology", "รังสีวิทยา"],
  ["anesthesiology", "วิสัญญีวิทยา"],
  ["family-medicine", "เวชศาสตร์ครอบครัว"],
  ["emergency", "เวชศาสตร์ฉุกเฉิน"],
  ["preventive", "เวชศาสตร์ป้องกันและสังคม"],
  ["rehabilitation", "เวชศาสตร์ฟื้นฟู"],
  ["surgery", "ศัลยศาสตร์"],
  ["orthopedics", "ศัลยศาสตร์ออร์โธปิดิคส์และกายภาพบำบัด"],
  ["obgyn", "สูติศาสตร์-นรีเวชวิทยา"],
  ["ent", "โสต นาสิก ลาริงซ์วิทยา"],
  ["internal-medicine", "อายุรศาสตร์"],
]);

export const CAREERS: Step[] = children("other", [
  ["research", "วิจัย"],
  ["policy", "policy maker"],
  ["law", "กฎหมาย"],
  ["private-hospital", "รพ.เอกชน"],
  ["startup", "start-up/entrepreneur"],
  ["military-police", "แพทย์ทหาร/ตำรวจ"],
  ["exploring", "ค้นหาตัวเอง"],
  ["rural", "ชนบท"],
  ["lecturer-regional", "อาจารย์แพทย์ รพศ"],
  ["lecturer-medschool", "อาจารย์แพทย์ รรพ"],
  ["lecturer-chula-rama", "อาจารย์แพทย์ จุฬา/รามา"],
  ["overseas", "ต่างประเทศ"],
  ["non-clinician", "Med-related non-clinician"],
  ["influencer", "Influencer/non-med"],
]);

/** Elective wards grouped by department; subspecialties count towards the main one. */
export const ELECTIVE_DEPARTMENTS: Step[] = children("elective", [
  ...SPECIALTIES.map((s): [string, string] => [`elective-${s.id}`, s.label]),
  ["elective-other", "อื่นๆ"],
]);

export const ALL_STEPS: Step[] = [...STAGES, ...ELECTIVE_DEPARTMENTS, ...TRACKS, ...SPECIALTIES, ...CAREERS];

export function findStep(id: string): Step | null {
  return ALL_STEPS.find((step) => step.id === id) ?? null;
}
