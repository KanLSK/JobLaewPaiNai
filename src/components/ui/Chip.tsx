export function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-block max-w-full rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-xs font-semibold break-words">{children}</span>;
}
