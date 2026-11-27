import type { Score as ScoreValue } from "@/lib/data/types";

export function Score({ score }: { score: ScoreValue }) {
  return (
    <span className="inline-flex items-baseline gap-1 text-sm">
      <span className="text-muted">{score.label}</span>
      <strong className="font-display text-base whitespace-nowrap">
        {score.value === null ? "–" : `${score.value}/${score.max}`}
      </strong>
    </span>
  );
}
