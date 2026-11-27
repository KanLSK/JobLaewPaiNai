/** Draws real components as a loading picture: grey instead of words and colour, and nothing can be used. */
export function Skeleton({ children }: { children: React.ReactNode }) {
  return (
    <>
      <p role="status" className="sr-only">กำลังโหลด…</p>
      <div inert aria-hidden="true" className="skeleton animate-pulse">{children}</div>
    </>
  );
}
