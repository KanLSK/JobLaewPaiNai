"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import map from "../../../config/thai-map.json";
import { HospitalCard } from "@/components/reviews/HospitalCard";
import { Empty } from "@/components/reviews/Results";
import type { HospitalReview } from "@/lib/data/types";
import { REGIONS, placeReviews, type DirectoryHospital, type RegionId } from "@/lib/hospitalMap";
import { hospitalHref } from "@/lib/hospitals";

const chip = "max-w-full rounded-xl border-2 border-ink px-2.5 py-0.5 text-xs font-semibold break-words";

function Item({ hospital, reviewed }: { hospital: DirectoryHospital; reviewed?: string }) {
  const review = hospital.review;
  return (
    <li className="space-y-2 rounded-2xl border-2 border-ink bg-white p-3">
      <h3 className="font-bold break-words">{hospital.name}</h3>
      <div className="flex flex-wrap gap-1.5">
        {hospital.gp && <span className={`${chip} bg-resident`}>เวชปฏิบัติทั่วไป (GP)</span>}
        {hospital.specialties.map((s) => (
          <span key={s} className={`${chip} bg-paper`}>{s}</span>
        ))}
      </div>
      {hospital.note && <p className="text-sm break-words">{hospital.note}</p>}
      {reviewed && (
        <Link href={hospitalHref(reviewed)} className="block text-sm font-semibold underline">ดูคะแนนและรีวิว →</Link>
      )}
      {review &&
        (review.startsWith("http") ? (
          <a href={review} rel="noreferrer" target="_blank" className="block text-sm font-semibold underline">อ่านข้อมูลจากโรงพยาบาล ↗</a>
        ) : (
          <details>
            <summary className="cursor-pointer text-sm font-semibold underline">อ่านรีวิว</summary>
            <p className="mt-2 text-sm leading-relaxed break-words whitespace-pre-line">{review}</p>
          </details>
        ))}
    </li>
  );
}

interface Props {
  hospitals: DirectoryHospital[];
  reviews: HospitalReview[];
  initialRegion?: RegionId;
}

export function HospitalMap({ hospitals, reviews, initialRegion }: Props) {
  const [region, setRegion] = useState<RegionId | null>(initialRegion ?? null);
  const [text, setText] = useState("");
  const results = useRef<HTMLDivElement>(null);
  const { found, unplaced } = placeReviews(hospitals, reviews);

  const choose = (id: RegionId | null) => {
    setRegion(id);
    setText("");
    // The address keeps the choice, so it can be shared and Back returns to it.
    window.history.replaceState(null, "", id ? `?region=${id}` : window.location.pathname);
    // On a phone the list is below the map.
    if (window.matchMedia?.("(max-width: 1023px)").matches) results.current?.scrollIntoView?.({ behavior: "smooth" });
  };

  const wanted = text.trim().toLowerCase();
  const shown = hospitals.filter((h) =>
    wanted ? [h.name, h.province, ...h.specialties].join("\n").toLowerCase().includes(wanted) : !region || h.region === region,
  );
  const title = wanted ? "ผลการค้นหา" : (REGIONS.find((r) => r.id === region)?.label ?? "ทุกภาค");

  const byProvince = (list: DirectoryHospital[]) =>
    [...new Set(list.map((h) => h.province))]
      .sort((a, b) => a.localeCompare(b, "th"))
      .map((province) => (
        <div key={province} className="space-y-2">
          <p className="font-display font-bold">จังหวัด{province === "กรุงเทพมหานคร" ? " " : ""}{province}</p>
          <ul className="grid items-start gap-3 sm:grid-cols-2">
            {list.filter((h) => h.province === province).map((h) => (
              <Item key={h.name} hospital={h} reviewed={found.get(h.name)} />
            ))}
          </ul>
        </div>
      ));

  return (
    <div className="space-y-10 pb-10">
      <div className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-4 lg:sticky lg:top-4">
          {/* The buttons below do the same job for keyboards and screen readers. */}
          <svg viewBox={map.viewBox} aria-hidden className="mx-auto max-h-[60vh] w-full">
            {map.provinces.map((p) => {
              const colour = REGIONS.find((r) => r.id === p.region)!.color;
              return (
                <path
                  key={p.name}
                  data-province={p.name}
                  d={p.d}
                  onClick={() => choose(p.region as RegionId)}
                  className="cursor-pointer transition-opacity"
                  // A stroke in the fill colour hides the lines between provinces of one region.
                  style={{ fill: colour, stroke: region === p.region ? "var(--color-ink)" : colour, strokeWidth: region === p.region ? 1 : 2, opacity: region && region !== p.region ? 0.35 : 1 }}
                >
                  <title>{p.name}</title>
                </path>
              );
            })}
          </svg>
          <div role="group" aria-label="เลือกภาค" className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={region === null}
              onClick={() => choose(null)}
              className="col-span-2 cursor-pointer rounded-xl border-2 border-ink bg-white px-2 py-1.5 text-sm font-semibold aria-pressed:shadow-sticker-sm aria-pressed:ring-2 aria-pressed:ring-ink"
            >
              ทุกภาค {hospitals.length}
            </button>
            {REGIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={region === r.id}
                onClick={() => choose(r.id)}
                className="cursor-pointer rounded-xl border-2 border-ink px-2 py-1.5 text-sm font-semibold aria-pressed:shadow-sticker-sm aria-pressed:ring-2 aria-pressed:ring-ink"
                style={{ backgroundColor: r.color }}
              >
                {r.label} {hospitals.filter((h) => h.region === r.id).length}
              </button>
            ))}
          </div>
        </div>

        <div ref={results} className="min-w-0 scroll-mt-4 space-y-5">
          <input
            type="search"
            aria-label="ค้นหาโรงพยาบาล"
            placeholder="ค้นหาชื่อโรงพยาบาล จังหวัด หรือสาขา"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-xl border-2 border-ink bg-white px-3 py-2 text-base"
          />
          <h2 aria-live="polite" className="text-2xl font-bold">{title} · {shown.length} แห่ง</h2>
          {shown.length === 0 && <Empty>ไม่พบโรงพยาบาลที่ตรงกัน</Empty>}
          {region || wanted
            ? byProvince(shown)
            : REGIONS.map((r) => (
                <section key={r.id} aria-label={r.label} className="space-y-4">
                  <p className="rounded-xl border-2 border-ink px-3 py-1.5 font-display text-lg font-bold" style={{ backgroundColor: r.color }}>{r.label}</p>
                  {byProvince(shown.filter((h) => h.region === r.id))}
                </section>
              ))}
        </div>
      </div>

      {unplaced.length > 0 && (
        <section aria-label="รีวิวที่ยังไม่ได้ระบุภาค" className="space-y-3">
          <h2 className="text-xl font-bold">รีวิวที่ยังไม่ได้ระบุภาค</h2>
          <div className="grid auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-3">
            {unplaced.map((r) => (
              <HospitalCard key={r.id} review={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
