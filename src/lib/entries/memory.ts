import type { Entry, EntryStore, NewEntry, RateStore } from "./types";

/** For tests; mirrors the MongoDB store. */
export function memoryStore(): EntryStore & RateStore {
  const entries = new Map<string, Entry>();
  const imports = new Set<string>();
  const hits = new Map<string, number[]>();
  let next = 0;

  const add = (entry: NewEntry) => {
    const id = `m${++next}`;
    entries.set(id, structuredClone({ ...entry, id }));
    if (entry.importId) imports.add(entry.importId);
    return id;
  };

  return {
    async list(status, kind) {
      return structuredClone(
        [...entries.values()]
          .filter((e) => e.status === status && (!kind || e.kind === kind))
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
      );
    },
    async get(id) {
      return structuredClone(entries.get(id) ?? null);
    },
    async insert(entry) {
      return add(entry);
    },
    async update(id, patch) {
      const entry = entries.get(id);
      if (!entry) return false;
      entries.set(id, structuredClone({ ...entry, ...patch }));
      return true;
    },
    async remove(id) {
      return entries.delete(id);
    },
    async count(status) {
      return [...entries.values()].filter((e) => e.status === status).length;
    },
    async addImport(entry) {
      if (imports.has(entry.importId)) return false;
      add(entry);
      return true;
    },
    async hit(key, windowMs) {
      const recent = [...(hits.get(key) ?? []).filter((at) => Date.now() - at <= windowMs), Date.now()];
      hits.set(key, recent);
      return recent.length;
    },
  };
}
