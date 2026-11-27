"use client";

import { useState } from "react";
import { SPECIALTIES } from "@/config/pathway";
import type { ElectiveReview } from "@/lib/data/types";
import { filterElectives } from "@/lib/filter";
import { ElectiveCards } from "./ElectiveCards";
import { FilterBar } from "./FilterBar";
import { Results } from "./Results";

export function ElectiveList({ reviews }: { reviews: ElectiveReview[] }) {
  const [text, setText] = useState("");
  const [hospital, setHospital] = useState("");
  const [specialtyId, setSpecialty] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState<"" | "score" | "hospital">("");

  const shown = filterElectives(reviews, { text, hospital, specialtyId, year, sort: sort || undefined });
  const years = [...new Set(reviews.map((r) => r.year))].sort().reverse();
  const hospitals = [...new Set(reviews.map((r) => r.hospital))].sort((a, b) => a.localeCompare(b, "th"));

  return (
    <>
      <FilterBar
        text={text}
        onText={setText}
        selects={[
          { label: "โรงพยาบาล", value: hospital, onChange: setHospital, options: hospitals.map((h) => ({ value: h, label: h })) },
          {
            label: "ภาควิชา",
            value: specialtyId,
            onChange: setSpecialty,
            options: SPECIALTIES.filter((s) => reviews.some((r) => r.specialtyId === s.id)).map((s) => ({ value: s.id, label: s.label })),
          },
          { label: "รุ่น", value: year, onChange: setYear, options: years.map((y) => ({ value: y, label: y })) },
          {
            label: "เรียงตาม",
            all: "เรียงตาม: ค่าเริ่มต้น",
            value: sort,
            onChange: (v) => setSort(v as typeof sort),
            options: [{ value: "score", label: "คะแนนสูงสุด" }, { value: "hospital", label: "ชื่อโรงพยาบาล" }],
          },
        ]}
      />
      <Results total={reviews.length} shown={shown.length} equalHeights>
        <ElectiveCards reviews={shown} />
      </Results>
    </>
  );
}
