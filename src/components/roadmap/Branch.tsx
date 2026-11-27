"use client";

import { useId, useState } from "react";

/** Always open from `md` up; collapsible on phones. */
export function Branch({ label, defaultOpen, className = "", desktop = "md:block", children }: { label: string; defaultOpen: boolean; className?: string; desktop?: "md:block" | "md:contents"; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="mx-auto mt-3 block cursor-pointer rounded-full border-2 border-ink bg-white px-4 py-1 text-sm font-semibold md:hidden"
      >
        {open ? "ซ่อน" : "ดู"} {label}
      </button>
      <div id={id} className={`mt-3 md:mt-0 ${desktop} ${open ? "block" : "hidden"}`}>
        {children}
      </div>
    </div>
  );
}
