"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function StepPanel({ stepId, title, children }: { stepId: string; title: string; children: React.ReactNode }) {
  const router = useRouter();
  const close = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.push("/", { scroll: false });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      // Next frame, once the roadmap is no longer inert.
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-step="${stepId}"]`)?.focus({ preventScroll: true }));
    };
  }, [router, stepId]);

  return (
    <div className="fixed inset-0 z-50">
      <Link href="/" scroll={false} tabIndex={-1} aria-hidden className="absolute inset-0 bg-ink/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="step-title"
        className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] animate-pop flex-col rounded-t-3xl border-2 border-ink bg-paper md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[28rem] md:rounded-t-none md:rounded-l-3xl"
      >
        <div className="flex items-start gap-3 border-b-2 border-ink p-4">
          <h2 id="step-title" className="min-w-0 flex-1 text-xl font-bold break-words">{title}</h2>
          <Link ref={close} href="/" scroll={false} className="rounded-full border-2 border-ink bg-white px-3 py-1 text-sm font-semibold">
            ปิด
          </Link>
        </div>
        <div className="space-y-4 overflow-y-auto overscroll-contain p-4">{children}</div>
      </div>
    </div>
  );
}
