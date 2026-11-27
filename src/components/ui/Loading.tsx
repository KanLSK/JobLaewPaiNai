type Shape = "map" | "cards" | "list" | "form";

const block = "animate-pulse rounded-2xl border-2 border-dashed border-ink bg-white";

const SHAPES: Record<Shape, { wrap: string; item: string; count: number }> = {
  // The pathway: boxes down the middle.
  map: { wrap: "flex flex-col items-center gap-8", item: "h-16 w-64", count: 4 },
  cards: { wrap: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", item: "h-44", count: 6 },
  list: { wrap: "mx-auto grid max-w-3xl gap-3", item: "h-24", count: 4 },
  form: { wrap: "mx-auto grid max-w-2xl gap-4", item: "h-12", count: 5 },
};

/** Shown while a page is fetching: its heading, then the rough shape of what is coming. */
export function Loading({ title, shape }: { title: string; shape: Shape }) {
  const { wrap, item, count } = SHAPES[shape];
  return (
    <div>
      <h1 className="mb-1 text-center text-3xl font-bold">{title}</h1>
      <p role="status" className="mb-6 text-center text-muted">กำลังโหลด…</p>
      <div aria-hidden className={wrap}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={`${block} ${item}`} />
        ))}
      </div>
    </div>
  );
}
