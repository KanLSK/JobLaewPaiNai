import Link from "next/link";
import type { Topic } from "./topics";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg aria-hidden viewBox="0 0 48 48" className="h-20 w-20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const KINDS: Record<Topic, { title: string; about: string; color: string; icon: React.ReactNode }> = {
  // A stethoscope.
  elective: {
    title: "Elective",
    about: "รีวิววอร์ดที่ไปมา",
    color: "bg-elective",
    icon: (
      <Icon>
        <path d="M12 6H9v13a10 10 0 0 0 20 0V6h-3" />
        <path d="M19 29v4a9 9 0 0 0 18 0v-5" />
        <circle cx="37" cy="23" r="5" />
      </Icon>
    ),
  },
  // A hospital building.
  hospital: {
    title: "โรงพยาบาลใช้ทุน",
    about: "ให้คะแนนและรีวิว รพ.",
    color: "bg-intern",
    icon: (
      <Icon>
        <path d="M10 42V12a3 3 0 0 1 3-3h22a3 3 0 0 1 3 3v30M5 42h38" />
        <path d="M24 15v10M19 20h10M20 42v-9h8v9" />
      </Icon>
    ),
  },
  // A clipboard.
  extern: {
    title: "Extern",
    about: "ประสบการณ์ปี 6",
    color: "bg-extern",
    icon: (
      <Icon>
        <path d="M17 9h-5v34h24V9h-5" />
        <path d="M18 5h12v8H18zM18 23h12M18 31h12" />
      </Icon>
    ),
  },
  // A graduation cap.
  resident: {
    title: "Resident",
    about: "เรียนต่อเฉพาะทาง",
    color: "bg-resident",
    icon: (
      <Icon>
        <path d="M4 18l20-9 20 9-20 9z" />
        <path d="M12 23v11c6 6 18 6 24 0V23M44 18v14" />
      </Icon>
    ),
  },
  // A signpost.
  note: {
    title: "เส้นทางอื่น",
    about: "ใช้ทุน ไม่ใช้ทุน และอาชีพอื่น",
    color: "bg-other",
    icon: (
      <Icon>
        <path d="M24 5v38M16 43h16" />
        <path d="M11 10h24l5 5-5 5H11zM37 25H13l-5 5 5 5h24z" />
      </Icon>
    ),
  },
};

export function Chooser() {
  return (
    <ul className="flex flex-wrap justify-center gap-5">
      {Object.entries(KINDS).map(([kind, { title, about, color, icon }]) => (
        <li key={kind} className="w-full max-w-56 sm:w-[calc((100%-2.5rem)/3)] sm:max-w-none">
          <Link
            href={`/contribute/${kind}`}
            className={`flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl border-2 border-ink p-4 text-center shadow-sticker transition hover:-translate-y-1 ${color}`}
          >
            {icon}
            <span className="font-display text-xl font-bold lg:whitespace-nowrap">{title}</span>
            <span className="text-sm">{about}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
