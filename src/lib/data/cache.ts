/** Memoises a loader. A failed reload serves the last good value until the next TTL. */
export function cached<T>(load: () => Promise<T>, ttlMs: number, now: () => number = Date.now): () => Promise<T> {
  let good: { value: T; at: number } | null = null;
  let pending: Promise<T> | null = null;

  return () => {
    if (good && now() - good.at <= ttlMs) return Promise.resolve(good.value);
    pending ??= load()
      .then((value) => {
        good = { value, at: now() };
        return value;
      })
      .catch((error) => {
        console.error(error);
        if (!good) throw error;
        good = { value: good.value, at: now() };
        return good.value;
      })
      .finally(() => {
        pending = null;
      });
    return pending;
  };
}
