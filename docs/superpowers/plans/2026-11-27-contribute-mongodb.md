# Contribution Forms and MongoDB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** People submit elective, hospital and step notes through forms; the owner approves them; approved entries and the current reviews are served from MongoDB.

**Architecture:** One `EntryStore` interface (in-memory for tests, MongoDB in production) holds every entry. Public pages read approved entries through the existing `ReviewRepository`; forms and `/admin` write through server actions that delegate to plain, testable functions.

**Tech Stack:** Next.js 16 App Router, React 19 (`useActionState`), TypeScript, Tailwind 4, `mongodb` 7 driver, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-27-contribute-mongodb-design.md`

## Global Constraints
- Read the relevant guide in `node_modules/next/dist/docs/01-app/` first (`02-guides/forms.md`, `data-security.md`, `authentication.md`).
- Nothing that is not `approved` ever reaches a public page.
- Every admin server action checks the session itself; server actions are public endpoints.
- `DATA_SOURCE=mongodb` switches it on. Otherwise the site behaves as today and `/contribute` and `/admin` say "ยังไม่เปิดใช้งาน".
- Env: `MONGODB_URI`, `MONGODB_DB` (default `joblaew`), `ADMIN_PASSWORD` (refuse if under 12 characters). Never log or commit their values; never print `.env.local`.
- Limits: name/ward/title 120 characters, long text 5000, year `^SI\d{3}$`, 10 submissions per address per hour, 5 failed logins per 15 minutes, 200 pending entries.
- No names, student IDs or submission times on public pages.
- UI text in Thai, medical terms in English where students use them; reuse the existing sticker style.
- Automated tests never connect to a real database. Work on branch `build`. Do not push.

## Review Focus
1. A permanently deleted imported review, then `import-mongo` run again: it stays deleted (Task 2).
2. A crafted form post carrying `status=approved`, `source`, `id` or unknown track/step ids: extras ignored, bad ids rejected (Task 1).
3. Over-long or blank (spaces only) Thai text: field error, typed text kept (Tasks 1, 4).
4. Approving or editing an entry already deleted in another tab: clear message, nothing recreated (Task 6).
5. Database unreachable: public pages serve the last copy or the existing error page; a submission reports failure and keeps the text (Tasks 3, 4).

## File Structure
| File | Responsibility |
|---|---|
| `src/lib/entries/types.ts` | Entry, store and rate-limit interfaces |
| `src/lib/entries/validate.ts` | Form data to entry data |
| `src/lib/entries/memory.ts`, `mongo.ts` | The two stores |
| `src/lib/entries/index.ts` | Configuration check and the shared store |
| `src/lib/entries/importSnapshot.ts`, `scripts/import-mongo.ts` | Migration |
| `src/lib/entries/submit.ts` | Spam protection and saving a submission |
| `src/lib/data/mongoRepository.ts` | Approved entries as reviews and notes |
| `src/lib/admin/session.ts`, `highlight.ts`, `moderate.ts` | Admin login, highlighting, actions' logic |
| `src/app/(site)/contribute/`, `src/app/(site)/admin/` | Pages and server actions |
| `src/components/contribute/`, `src/components/admin/` | Forms and entry cards |

---

### Task 1: Entry model and validation

**Files:** Create `src/lib/entries/types.ts`, `validate.ts`. Modify `src/lib/data/types.ts`, `src/components/reviews/ElectiveList.tsx`. Test `tests/lib/validate.test.ts`, `tests/components/electiveYears.test.tsx`.

**Interfaces — Produces:**
```ts
// data/types.ts: ElectiveReview.year becomes string
export interface NoteEntry { id: string; stepId: string; title: string; text: string }
// entries/types.ts
export type Kind = "elective" | "hospital" | "note";
export type Status = "pending" | "approved" | "rejected";
export type EntryData = Omit<ElectiveReview, "id"> | Omit<HospitalReview, "id"> | Omit<NoteEntry, "id">;
export interface NewEntry { kind: Kind; status: Status; source: "import" | "form"; importId?: string; data: EntryData; createdAt: Date }
export interface Entry extends NewEntry { id: string }
export interface EntryStore {
  list(status: Status, kind?: Kind): Promise<Entry[]>;          // createdAt ascending
  get(id: string): Promise<Entry | null>;                        // null for unknown, malformed or deleted
  insert(entry: NewEntry): Promise<string>;
  update(id: string, patch: { status?: Status; data?: EntryData }): Promise<boolean>; // false if gone
  remove(id: string): Promise<boolean>;                          // imported: keeps only importId as a tombstone
  count(status: Status): Promise<number>;
  addImport(entry: NewEntry & { importId: string }): Promise<boolean>; // false if importId was ever seen
}
export interface RateStore { hit(key: string, windowMs: number): Promise<number> } // hits in window, including this one
// entries/validate.ts
export type FieldErrors = Record<string, string>;
export function validate(kind: Kind, form: Record<string, string>, aliases: Aliases):
  { ok: true; data: EntryData } | { ok: false; errors: FieldErrors };
export const NOTE_STEPS: Step[]; // extern, graduate, intern, resident, other, TRACKS, SPECIALTIES, CAREERS
```
Form field names: elective `year, hospital, department, ward, overall, learned, chill, review, advice`; hospital `hospital, track, department, s0…s9, summary`; note `step, title, text`; all `consent`. `department` is a SPECIALTIES id or `other`.

Mapping: elective matches `parseSI130`'s output (same score labels and section labels, all max 5, `province`/`threeWords` null, `wardRaw` = ward or else the department label). Hospital uses `HOSPITAL_SCORE_HEADERS` labels, `trackRaw`/`departmentRaw` = labels (`""` if none). Hospital names pass through `canonical(aliases, "hospital", …)`.

- [ ] **Step 1: Failing tests**
```ts
const aliases = buildAliases([{ kind: "hospital", from: "siriraj", to: "ศิริราช" }]);
const good = { year: "SI131", hospital: " siriraj ", department: "surgery", ward: "CVT", overall: "5", learned: "4", chill: "", review: "ดีมาก", advice: "", consent: "on" };
test("an elective is shaped like an imported one", () => {
  const r = validate("elective", { ...good, status: "approved", id: "x", source: "import" }, aliases);
  expect(r).toMatchObject({ ok: true, data: { year: "SI131", hospital: "ศิริราช", specialtyId: "surgery", wardRaw: "CVT", overall: { value: 5, max: 5 } } });
  expect(Object.keys((r as any).data)).not.toEqual(expect.arrayContaining(["status", "id", "source"]));
});
test.each([["year", "131"], ["hospital", "   "], ["overall", "6"], ["review", " "], ["review", "ก".repeat(5001)], ["department", "nope"], ["consent", ""]])(
  "rejects %s = %s", (field, value) => {
    expect(validate("elective", { ...good, [field]: value }, aliases)).toMatchObject({ ok: false, errors: { [field]: expect.any(String) } });
  });
test("hospital needs a known track and the overall score only", () => {
  const form = { hospital: "รพ.แพร่", track: "lottery", department: "", summary: "", s9: "4", consent: "on" };
  expect(validate("hospital", form, aliases).ok).toBe(true);
  expect(validate("hospital", { ...form, track: "x" }, aliases).ok).toBe(false);
  expect(validate("hospital", { ...form, s9: "" }, aliases).ok).toBe(false);
});
test("a note needs an allowed step", () => {
  const form = { step: "extern", title: "t", text: "x", consent: "on" };
  expect(validate("note", form, aliases)).toMatchObject({ ok: true, data: { stepId: "extern" } });
  expect(validate("note", { ...form, step: "elective" }, aliases).ok).toBe(false);
});
```
`electiveYears.test.tsx`: render `<ElectiveList>` with reviews of years `SI131` and `SI129`; the "รุ่น" select's option values are `["", "SI131", "SI129"]`.

- [ ] **Step 2:** `npm test` — new tests fail.
- [ ] **Step 3:** Implement. Trim before checking. Year options: distinct years, sorted descending.
- [ ] **Step 4:** `npm test && npm run typecheck` — pass.
- [ ] **Step 5:** Commit `feat: entry model and form validation`.

### Task 2: Stores and migration

**Files:** Create `src/lib/entries/memory.ts`, `mongo.ts`, `index.ts`, `importSnapshot.ts`, `scripts/import-mongo.ts`. Modify `package.json`. Test `tests/lib/store.test.ts`, `tests/lib/importSnapshot.test.ts`.

**Interfaces — Consumes:** Task 1 types. **Produces:**
```ts
export function memoryStore(): EntryStore & RateStore;
export function mongoStore(uri: string, dbName: string): EntryStore & RateStore;
export function mongoConfigured(env: Record<string, string | undefined>): boolean; // DATA_SOURCE==="mongodb" && !!MONGODB_URI
export function getStore(): EntryStore & RateStore; // one per process
export function importSnapshot(store: EntryStore, snapshot: Snapshot): Promise<{ added: number; skipped: number }>;
```

- [ ] **Step 1: Failing tests**
```ts
const snapshot = { electives: [{ id: "SI130-0", hospital: "a" }, { id: "SI130-1", hospital: "b" }], hospitals: [{ id: "H-0", hospital: "c" }] } as any;
test("import is repeatable, keeps edits and deletions", async () => {
  const store = memoryStore();
  expect(await importSnapshot(store, snapshot)).toEqual({ added: 3, skipped: 0 });
  const [first, second] = await store.list("approved");
  expect(first.importId).toBe("SI130-0");
  await store.update(first.id, { data: { ...first.data, hospital: "edited" } as any });
  await store.remove(second.id);
  expect(await importSnapshot(store, snapshot)).toEqual({ added: 0, skipped: 3 });
  const after = await store.list("approved");
  expect(after.map((e) => (e.data as any).hospital)).toEqual(["edited", "c"]);
  expect(await store.get(second.id)).toBeNull();
});
```
`store.test.ts` (memory): insert/list by status and kind; `update` and `remove` of an unknown id return `false`; `count`; `hit("k", 1000)` returns 1 then 2, and 1 again after the window (use `vi.useFakeTimers`).

- [ ] **Step 2:** `npm test` — fail.
- [ ] **Step 3:** Implement. `npm install mongodb`. Imports: `status: "approved"`, `source: "import"`, `createdAt: new Date(index)` to keep order, `data` without `id`. Mongo: collections `entries` (unique sparse index on `importId`) and `hits` (TTL index); cache the `MongoClient` promise, clear it on failure; `serverSelectionTimeoutMS: 5000`; a tombstone is `status: "deleted"` with `data` unset. Pass ids only as validated `ObjectId`s, never raw objects.
- [ ] **Step 4:** Script `"import-mongo": "tsx --env-file=.env.local scripts/import-mongo.ts"`; it reads `content/reviews.json`, prints added/skipped and the database name (not the URI), and closes the client.
- [ ] **Step 5:** `npm test && npm run typecheck` — pass. Commit `feat: entry stores and MongoDB import`.

### Task 3: Serve approved entries, show notes

**Files:** Create `src/lib/data/mongoRepository.ts`. Modify `src/lib/data/repository.ts`, `snapshot.ts`, `src/lib/stepData.ts`, `src/components/roadmap/RoadmapView.tsx`, `src/app/(site)/page.tsx`, existing tests that call changed signatures. Test `tests/lib/mongoRepository.test.ts`, extend `stepData.test.ts` and `roadmap.test.tsx`.

**Interfaces — Produces:**
```ts
interface ReviewRepository { /* existing */ getNotes(): Promise<NoteEntry[]> } // [] for file, csv, sheets
export function mongoRepository(store: EntryStore, ttlMs?: number): ReviewRepository; // default 60_000
contentFor(stepId, electives, hospitals, notes = []): { electives; hospitals; notes }
countByStep(electives, hospitals, notes = []): Record<string, number>
// RoadmapView gains prop notes?: NoteEntry[]
```
Review ids are `importId ?? id`. Order: form entries newest first, then imports in original order.

- [ ] **Step 1: Failing tests:** with a memory store holding pending, rejected, approved-form and approved-import electives, `getElectiveReviews()` returns only the approved two, form first; ids as above. `cached` behaviour: after one good load, a store whose `list` throws still yields the same list once the TTL passes (`ttlMs: 0`, stub `console.error`). `countByStep([], [], [{ id: "n", stepId: "extern", title: "t", text: "x" }]).extern === 1`. Rendering `RoadmapView stepId="extern"` with that note shows `t` and `x`; an empty step shows a link to `/contribute?kind=note&step=extern`.
- [ ] **Step 2:** `npm test` — fail.
- [ ] **Step 3:** Implement, using `cached`. `getRepository` accepts `DATA_SOURCE=mongodb`. Notes render as `Card` with `break-words whitespace-pre-line`. Contribute link by step: elective steps → `?kind=elective`, tracks → `?kind=hospital&step=<trackId>`, others → `?kind=note&step=<id>`; show it only when the page passes `canContribute` (`mongoConfigured`). Adjust the test above to pass it.
- [ ] **Step 4:** `npm test && npm run typecheck && npm run build` — pass.
- [ ] **Step 5:** Commit `feat: serve approved entries from MongoDB and show step notes`.

### Task 4: Contribution forms

**Files:** Create `src/lib/entries/submit.ts`, `src/app/(site)/contribute/page.tsx`, `actions.ts`, `src/components/contribute/ContributeForm.tsx`. Modify `src/app/(site)/layout.tsx` (nav "เพิ่มรีวิว", only when configured), `next.config.ts` (add `./config/aliases.csv` to tracing). Test `tests/lib/submit.test.ts`, `tests/components/contribute.test.tsx`.

**Interfaces — Produces:**
```ts
export type SubmitResult = { ok: true } | { ok: false; message: string; errors: FieldErrors; values: Record<string, string> };
export function submitEntry(deps: { store: EntryStore & RateStore; aliases: Aliases; address: string }, kind: Kind, form: Record<string, string>): Promise<SubmitResult>;
```
Order: honeypot field `website` filled → return `ok` and save nothing; rate limit (key = SHA-256 of address); pending cap; `validate`; insert as `pending`/`form`. Store errors are caught and returned as `ok: false` with `values`.

- [ ] **Step 1: Failing tests:** valid form → one `pending` entry, none `approved`; honeypot → `ok`, count 0; 11th submission from one address → `ok: false`, another address still succeeds; 200 pending → refused; invalid → `values` echo what was typed; a store whose `insert` throws → `ok: false` with `values`. Component: unconfigured page shows "ยังไม่เปิดใช้งาน"; configured form has the three tabs, the consent text "ไม่มีชื่อบุคคล เบอร์ติดต่อ หรือข้อมูลผู้ป่วย", and a required hospital input with a `datalist`.
- [ ] **Step 2:** `npm test` — fail.
- [ ] **Step 3:** Implement. Action calls `requireStudent()`, checks `mongoConfigured`, checks `kind` against the three values, reads the address from `x-forwarded-for` via `await headers()`. Client uses `useActionState`; disable the button while pending; remount the form with a `key` per response so `defaultValue` (including selects) restores typed values. Success text "ได้รับแล้ว รอตรวจสอบ". `?kind=` and `?step=` preselect. Hospital suggestions come from approved reviews.
- [ ] **Step 4:** `npm test && npm run typecheck && npm run build` — pass.
- [ ] **Step 5:** Commit `feat: contribution forms`.

### Task 5: Admin login

**Files:** Create `src/lib/admin/session.ts`, `src/app/(site)/admin/page.tsx` (login form only for now), `actions.ts`. Test `tests/lib/adminSession.test.ts`.

**Interfaces — Produces:**
```ts
export function adminPassword(env): string | null;                 // null if unset or < 12 chars
export function checkPassword(given: string, actual: string): boolean; // timingSafeEqual over SHA-256 of both
export function makeToken(password: string, now?: number): string;  // "<expiry>.<hmac-sha256>", 8 hours
export function validToken(token: string | undefined, password: string, now?: number): boolean;
export async function requireAdmin(): Promise<void>;               // throws unless the cookie "admin" is valid
```
- [ ] **Step 1: Failing tests:** `adminPassword({ ADMIN_PASSWORD: "short" })` is null; a fresh token validates; it fails after 8 h + 1 ms, with another password, with an altered expiry, and for `undefined`, `""`, `"a.b"`.
- [ ] **Step 2:** `npm test` — fail.
- [ ] **Step 3:** Implement with `node:crypto`. Cookie: `httpOnly`, `sameSite: "strict"`, `secure` in production, `path: "/"`, `maxAge` 8 h. Login action: count failures with `hit("login:<hashed address>", 15 min)`, refuse after 5, same message for any failure. Add logout.
- [ ] **Step 4:** `npm test && npm run typecheck` — pass. Commit `feat: password login for admin`.

### Task 6: Approval page

**Files:** Create `src/lib/admin/highlight.ts`, `moderate.ts`, `src/components/admin/EntryEditor.tsx`. Modify the admin `page.tsx`, `actions.ts`. Test `tests/lib/highlight.test.ts`, `moderate.test.ts`, `tests/lib/adminActions.test.ts`.

**Interfaces — Produces:**
```ts
export function highlight(text: string): { text: string; flagged: boolean }[];
export function toForm(entry: Entry): Record<string, string>;
export function setStatus(store, id: string, status: Status): Promise<string>;  // message for the screen
export function saveEdit(store, aliases, id: string, form: Record<string, string>): Promise<{ ok: boolean; message: string; errors?: FieldErrors }>;
export function destroy(store, id: string): Promise<string>;
```
`saveEdit` can change every field an entry has (hospital, year, ward, department, track, each score, each section text, province, three words, summary, note step/title/text) under the same limits. It patches the stored data instead of rebuilding it through `validate`, so each score keeps its own `max` and SI129's extra sections survive.

- [ ] **Step 1: Failing tests:** `highlight` flags `081-234-5678`, `a@b.com`, `Line id: abc123`, `อ.สมชาย`, `พญ. สมหญิง`, a 7-digit number; joining the pieces returns the input unchanged. `setStatus`/`saveEdit` on a missing id return "ไม่พบรายการนี้แล้ว" and `store.count` stays 0. Editing an imported SI129 entry's review text keeps `overall.max === 10`. With `next/headers` mocked to no cookie, each exported admin action (approve, reject, unpublish, edit, delete) rejects and the store is unchanged.
- [ ] **Step 2:** `npm test` — fail.
- [ ] **Step 3:** Implement. Each action starts with `await requireAdmin()`. Page: tabs pending / approved / rejected with counts; each entry shows every field with flagged text marked (render as React nodes, never HTML strings); delete asks for confirmation. Without a session, render only the login form and load no entries.
- [ ] **Step 4:** `npm test && npm run typecheck && npm run build` — pass. Commit `feat: approval page`.

### Task 7: Documentation and live check

**Files:** Modify `README.md`, `.env.example`.

- [ ] **Step 1:** Document the three variables, the Atlas user and network access, `npm run import-mongo`, using a separate test database, `/admin`, and that switching on means `DATA_SOURCE=mongodb` locally and in Vercel. Commit `docs: MongoDB setup`.
- [ ] **Step 2: Needs the owner's `.env.local`; skip and say so if absent.** With a test `MONGODB_DB`: `npm run import-mongo` prints `added 144, skipped 0`; again prints `added 0, skipped 144`.
- [ ] **Step 3:** `npm run dev`: submit one of each form, confirm none is public, approve, see each within a minute, check roadmap counts, delete the three test entries. Check phone width for `/contribute` and `/admin`.
