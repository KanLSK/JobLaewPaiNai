"use client";

import { useState } from "react";
import { SPECIALTIES, TRACKS } from "@/config/pathway";
import type { HospitalReview } from "@/lib/data/types";
import { filterHospitals } from "@/lib/filter";
import { FilterBar } from "./FilterBar";
import { HospitalCard } from "./HospitalCard";
import { Results } from "./Results";

export function HospitalList({ reviews }: { reviews: HospitalReview[] }) {
  const [text, setText] = useState("");
  const [trackId, setTrack] = useState("");
  const [specialtyId, setSpecialty] = useState("");
  const shown = filterHospitals(reviews, { text, trackId, specialtyId });

  return (
    <>
      <FilterBar
        text={text}
        onText={setText}
        selects={[
          { label: "Track", value: trackId, onChange: setTrack, options: TRACKS.map((t) => ({ value: t.id, label: t.label })) },
          {
            label: "ภาควิชา",
            value: specialtyId,
            onChange: setSpecialty,
            options: SPECIALTIES.filter((s) => reviews.some((r) => r.specialtyId === s.id)).map((s) => ({ value: s.id, label: s.label })),
          },
        ]}
      />
      <Results total={reviews.length} shown={shown.length} equalHeights>
        {shown.map((r) => (
          <HospitalCard key={r.id} review={r} />
        ))}
      </Results>
    </>
  );
}
