"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function StepPanel({ stepId, title, children }: { stepId: string; title: string; children: React.ReactNode }) {
  const router = useRouter();
  const close = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    close.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.push("/", { scroll: false });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      // Next frame, once the roadmap is no longer inert.
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-step="${stepId}"]`)?.focus({ preventScroll: true }));
    };
  }, [router, stepId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <Link href="/" scroll={false} tabIndex={-1} aria-hidden className="absolute inset-0 bg-ink/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="step-title"
        className="relative flex max-h-[85dvh] w-full max-w-3xl animate-pop flex-col overflow-hidden rounded-3xl border-2 border-ink bg-paper shadow-sticker"
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
