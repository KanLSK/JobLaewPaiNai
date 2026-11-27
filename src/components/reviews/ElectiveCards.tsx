"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Score } from "@/components/ui/Score";
import type { ElectiveReview } from "@/lib/data/types";
import { ElectiveCard } from "./ElectiveCard";

/**
 * Same-size preview cards, each opening its full review.
 * `closeAllHref` is set inside a step pop-up, where the reader sits one level deeper.
 */
export function ElectiveCards({ reviews, closeAllHref }: { reviews: ElectiveReview[]; closeAllHref?: string }) {
  const [open, setOpen] = useState<{ review: ElectiveReview; from: HTMLElement } | null>(null);

  return (
    <>
      {reviews.map((review) => (
        <ElectiveCard key={review.id} review={review} onOpen={(from) => setOpen({ review, from })} />
      ))}
      {open && (
        <Reader
          review={open.review}
          closeAllHref={closeAllHref}
          onClose={() => {
            setOpen(null);
            open.from.focus();
          }}
        />
      )}
    </>
  );
}

const button = "shrink-0 cursor-pointer rounded-full border-2 border-ink bg-white px-3 py-1 text-sm font-semibold";

function Reader({ review, closeAllHref, onClose }: { review: ElectiveReview; closeAllHref?: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const first = useRef<HTMLButtonElement>(null);

  // The page stays locked while the dialog is modal, so close it before focus moves back.
  const close = () => {
    dialog.current?.close?.();
    onClose();
  };

  useEffect(() => {
    const element = dialog.current!;
    // A modal dialog sits above everything and keeps focus inside it.
    if (element.showModal) element.showModal();
    else element.setAttribute("open", "");
    first.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="reader-title"
      onClick={(event) => event.target === event.currentTarget && close()}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        // Keep the pop-up underneath from closing too.
        event.preventDefault();
        event.stopPropagation();
        close();
      }}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className="m-auto max-h-[85dvh] w-[calc(100%-1.5rem)] max-w-3xl overflow-hidden rounded-3xl border-2 border-ink bg-paper p-0 text-ink shadow-sticker backdrop:bg-ink/40"
    >
      <div className="flex max-h-[85dvh] animate-pop flex-col">
        <div className="flex items-start gap-3 border-b-2 border-ink bg-elective p-4">
          <div className="min-w-0 flex-1">
            {review.province && (
              <div className="mb-1">
                <Chip>{review.province}</Chip>
              </div>
            )}
            <h2 id="reader-title" className="text-xl font-bold break-words">{review.wardRaw || "ไม่ระบุวอร์ด"}</h2>
            <p className="text-sm break-words">{review.hospital}</p>
          </div>
          {closeAllHref ? (
            <>
              <button ref={first} type="button" onClick={close} className={button}>← กลับ</button>
              <Link href={closeAllHref} scroll={false} className={button}>ปิด</Link>
            </>
          ) : (
            <button ref={first} type="button" onClick={close} className={button}>ปิด</button>
          )}
        </div>

        <div className="space-y-6 overflow-y-auto overscroll-contain p-5 sm:p-8">
          <ul className="flex flex-wrap gap-2">
            {[review.overall, ...review.extra].map((score) => (
              <li key={score.label} className="rounded-xl border-2 border-ink bg-white px-3 py-1.5">
                <Score score={score} />
              </li>
            ))}
          </ul>
          {review.threeWords && <p className="font-display text-lg break-words">“{review.threeWords}”</p>}
          {review.sections.map((section) => (
            <section key={section.label} className="rounded-2xl border-2 border-ink bg-white p-4 sm:p-5">
              <h3 className="mb-2 font-bold">{section.label}</h3>
              <p className="text-base leading-8 whitespace-pre-wrap break-words">{section.text.replace(/\n\s*\n/g, "\n\n")}</p>
            </section>
          ))}
        </div>
      </div>
    </dialog>
  );
}
