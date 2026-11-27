# จบแล้วไปไหน Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A playful Next.js site, readable only by Mahidol students, showing the path after medical school as a roadmap with elective and internship-hospital reviews.

**Architecture:** Server-rendered App Router pages read reviews through one `ReviewRepository`, built on a `TableSource` that is either a private Google Sheet or the local CSVs. Auth.js Google sign-in (cookie session, no database) guards every page. Browsers only ever receive parsed, approved, allow-listed fields.

**Tech Stack:** Next.js 16.4, React 19.3, TypeScript ^5.9 (not 7.x, to avoid untested tooling), Tailwind CSS 4.3, next-auth 5.0.0-beta.32, google-auth-library, csv-parse, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-27-joblaew-website-design.md`

## Global Constraints

- Next.js 16 uses `src/proxy.ts`, not `middleware.ts`. Check `node_modules/next/dist/docs/` before using a Next API.
- Allowed domains, exact match: `student.mahidol.edu`, `student.mahidol.ac.th` (env `ALLOWED_EMAIL_DOMAINS`).
- Never read or output: `Timestamp`, `Rotate`, `รหัสนักศึกษา`, `ข้อมูลติดต่อรพ (ชื่อเจ้าหน้าที่, เบอร์โทรศัพท์/line/อื่นๆ)`.
- Only rows whose `approved` cell is `yes` (trimmed, any case) are shown.
- `Data/` and `.env*` (except `.env.example`) are never committed. Test fixtures use invented text only.
- Review data is never placed in `public/` or in a statically generated page.
- Data cache TTL: 10 minutes.
- UI copy is Thai, with medical terms in English where students use them. Empty state text: `รอข้อมูล`.
- Fonts via `next/font/google`: Mali (headings), IBM Plex Sans Thai (body).
- Stage colors: elective violet, extern sky, graduate sunflower, intern coral, resident mint, other pink. Background warm off-white, ink dark. No dark mode.
- Respect `prefers-reduced-motion`; everything works by keyboard.
- `DEV_APPROVE_ALL=1` and `AUTH_DEV_BYPASS=1` work only when `NODE_ENV === "development"` and `DATA_SOURCE === "csv"`.
- Do not deploy or create anything in the user's Google or Vercel accounts; document the steps.

## Review Focus

1. A sheet header gains stray spaces or is renamed → spaces are ignored; a rename gives an error naming the column (Task 3).
2. A score is blank, text, or out of range → shown as `–`, never `0` or `NaN` (Task 4).
3. Look-alike email (`a@student.mahidol.edu.evil.com`, unverified, uppercase domain) → rejected, rejected, accepted (Task 2).
4. `?step=nonsense` or an unknown hospital URL → plain roadmap, or a not-found page; no crash (Tasks 7, 8).
5. Review text with HTML, very long unbroken strings or many line breaks → shown as text, wraps, breaks kept (Task 6).

## Files

```
config/aliases.csv                 spelling → canonical name
src/config/pathway.ts              stages, tracks, specialties, careers
src/lib/auth/{allowed,session}.ts  domain rule; requireStudent()
src/auth.ts, src/proxy.ts          Auth.js setup; redirect signed-out users
src/lib/data/types.ts              review and column types
src/lib/data/{csv,sheets}Source.ts two TableSource implementations
src/lib/data/{aliases,parse}.ts    normalising and parsing
src/lib/data/{cache,repository}.ts caching and ReviewRepository
src/components/ui/                 Card, Chip, Score, ReviewText
src/components/roadmap/            Roadmap, StepNode, StepPanel
src/components/reviews/            ElectiveCard, HospitalCard, FilterBar
src/app/                           signin, (site)/{page,electives,hospitals}
tests/                             mirrors src/lib and components
README.md, .env.example            setup guide
```

---

### Task 1: Project skeleton and pathway config

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.gitignore`, `src/app/{layout.tsx,page.tsx,globals.css,robots.ts}`, `src/config/pathway.ts`
- Test: `tests/config/pathway.test.ts`

**Interfaces — Produces:**
```ts
export type StageId = "elective"|"extern"|"graduate"|"intern"|"resident"|"other";
export interface Step { id: string; label: string; stage: StageId; parentId: string|null }
export const STAGES: Step[]; export const TRACKS: Step[]; export const SPECIALTIES: Step[]; export const CAREERS: Step[];
export function findStep(id: string): Step | null;
```
Track ids in outline order: `lottery, fixed-moph, fixed-medschool, other-hospital, military, abroad`. Specialty and career ids are short English slugs (`internal-medicine, surgery, orthopedics, …`). Labels are copied exactly (trimmed) from `Data/After Extern Life _ Data Draft - Tab1_ Table of contents.csv`: column 0 rows under the header = tracks, column 1 = specialties, column 3 = careers (skip `Resources`). Stage labels: `Elective, Extern, จบแล้วไปไหน?, ใช้ทุน / Intern, Resident, เส้นทางอื่น`.

- [ ] **Step 1:** `git init`; write `.gitignore` (`node_modules .next Data/ .env* !.env.example .DS_Store`); confirm `git status --porcelain` lists nothing under `Data/`.
- [ ] **Step 2:** Write `package.json` (scripts `dev, build, start, test` = `vitest run`, `typecheck` = `tsc --noEmit`) and configs by hand (the folder is not empty, so do not use create-next-app); `npm install` the stack above. Alias `@/*` → `src/*`.
- [ ] **Step 3:** Write the failing test:
```ts
test("pathway matches the outline", () => {
  expect(TRACKS).toHaveLength(6); expect(SPECIALTIES).toHaveLength(18); expect(CAREERS).toHaveLength(14);
  const ids = [...STAGES,...TRACKS,...SPECIALTIES,...CAREERS].map(s => s.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(findStep("lottery")?.parentId).toBe("intern");
  expect(findStep("nonsense")).toBeNull();
});
```
- [ ] **Step 4:** `npm test` → FAIL (module missing). Implement `pathway.ts`; add layout with fonts, color tokens in `globals.css` (`@theme`), `robots.ts` disallowing all, `robots: {index:false}` metadata and an `X-Robots-Tag: noindex` header.
- [ ] **Step 5:** `npm test && npm run typecheck && npm run build` → all succeed. Commit `chore: scaffold app and pathway config`.

### Task 2: Sign-in restricted to students

**Files:**
- Create: `src/lib/auth/allowed.ts`, `src/lib/auth/session.ts`, `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/proxy.ts`, `src/app/signin/page.tsx`, `.env.example`
- Test: `tests/lib/auth.test.ts`

**Interfaces — Produces:**
```ts
export function allowedDomains(env?: string): string[];
export function isAllowedEmail(email: string|null|undefined, domains: string[]): boolean;
export function isAllowedProfile(p: {email?: string|null; email_verified?: boolean|null}, domains: string[]): boolean;
export function devBypassEnabled(env: Record<string,string|undefined>): boolean;
export function safeCallback(value: string|undefined): string; // same-site relative path, else "/"
export async function requireStudent(): Promise<{email: string; name: string|null}>; // redirects to /signin
```

- [ ] **Step 1:** Failing tests, with `d = allowedDomains(undefined)`:
```ts
expect(isAllowedEmail("a@student.mahidol.edu", d)).toBe(true);
expect(isAllowedEmail("a@student.mahidol.ac.th", d)).toBe(true);
expect(isAllowedEmail("a@STUDENT.Mahidol.EDU", d)).toBe(true);
for (const bad of ["a@student.mahidol.edu.evil.com","a@mahidol.edu","a@alumni.mahidol.ac.th","a@gmail.com","a@x@student.mahidol.edu","@student.mahidol.edu","",null])
  expect(isAllowedEmail(bad, d)).toBe(false);
expect(isAllowedProfile({email:"a@student.mahidol.edu", email_verified:false}, d)).toBe(false);
expect(devBypassEnabled({NODE_ENV:"production",DATA_SOURCE:"csv",AUTH_DEV_BYPASS:"1"})).toBe(false);
expect(devBypassEnabled({NODE_ENV:"development",DATA_SOURCE:"sheets",AUTH_DEV_BYPASS:"1"})).toBe(false);
expect(devBypassEnabled({NODE_ENV:"development",DATA_SOURCE:"csv",AUTH_DEV_BYPASS:"1"})).toBe(true);
for (const bad of ["https://evil.com","//evil.com","/\\evil.com",undefined]) expect(safeCallback(bad)).toBe("/");
expect(safeCallback("/?step=lottery")).toBe("/?step=lottery");
```
- [ ] **Step 2:** `npm test` → FAIL. Implement.
- [ ] **Step 3:** `auth.ts`: Google provider, JWT sessions, `signIn` callback returns `isAllowedProfile(profile, …)`, sign-in and error page `/signin`. `requireStudent` re-checks the domain on every call. `proxy.ts` redirects everything except `/signin`, `/api/auth/*`, `/_next/*`, `/robots.txt`, favicon to `/signin?callbackUrl=…`.
- [ ] **Step 4:** Sign-in page: wordmark `จบแล้วไปไหน`, line `เส้นทางหลังเรียนหมอ รวมรีวิวจากรุ่นพี่`, button `เข้าสู่ระบบด้วย Google`; on `?error=AccessDenied` show `บัญชีนี้เข้าไม่ได้ กรุณาใช้อีเมลนักศึกษา @student.mahidol.edu หรือ @student.mahidol.ac.th`.
- [ ] **Step 5:** Tests and build pass. Commit `feat: student-only Google sign-in`.

### Task 3: Table sources (CSV and Google Sheets)

**Files:**
- Create: `src/lib/data/{types,columns,csvSource,sheetsSource}.ts`
- Test: `tests/lib/sources.test.ts`, `tests/fixtures/*.csv`

**Interfaces — Produces:**
```ts
export type TableId = "si129"|"si130"|"hospitals"|"aliases";
export interface ColumnSpec { key: string; header: string; occurrence?: number; optional?: boolean }
export type Row = Record<string,string>; // keys = ColumnSpec.key; missing cells ""
export interface TableSource { readTable(table: TableId, columns: ColumnSpec[]): Promise<Row[]> }
export class MissingColumnError extends Error { table: TableId; header: string }
export function resolveColumns(headerRows: string[][], columns: ColumnSpec[], table: TableId): {indexes: Record<string,number>; dataStart: number};
export function csvSource(files: Record<TableId,string>): TableSource;
export function sheetsSource(opts: {sheetId: string; tabs: Record<TableId,string>; getToken: () => Promise<string>; fetchImpl?: typeof fetch}): TableSource;
```
Headers compare after trimming and collapsing whitespace. `occurrence` is 1-based (SI129 repeats headers). `hospitals` has two header rows, located by the cell starting `โรงพยาบาลใช้ทุน`; score sub-headers are on the second, data starts after it. Other tables use row 1. A missing `optional` column yields `""` (`approved` is optional, so an unmarked sheet shows nothing). Default tab names: `SI129, SI130, hospitals, aliases`, overridable by env.

- [ ] **Step 1:** Failing tests: duplicate header with `occurrence: 2` returns the second column; header `"Rotate  "` matches `Rotate`; renamed header throws `MissingColumnError` whose message contains the header; unrequested columns are absent from rows (`expect(JSON.stringify(rows)).not.toContain("6101999")`); the two-row hospital header resolves; sheets source with a fake `fetch` requests only the header rows (`1:5`) and the resolved column ranges — assert no requested data range includes the private column's letter; non-200 throws.
- [ ] **Step 2:** `npm test` → FAIL. Implement. CSV via `csv-parse/sync` with BOM and multiline cells. Sheets via REST `values:batchGet`, `majorDimension=COLUMNS`, scope `spreadsheets.readonly`; support column letters past Z.
- [ ] **Step 3:** Tests pass. Commit `feat: CSV and Google Sheets table sources`.

### Task 4: Parsing, aliases and approval

**Files:**
- Create: `src/lib/data/{aliases,parse}.ts`, `config/aliases.csv`; extend `types.ts`, `columns.ts`
- Test: `tests/lib/parse.test.ts`

**Interfaces — Consumes:** `Row`, `findStep`. **Produces:**
```ts
export interface Score { label: string; value: number|null; max: 5|10 }
export interface ElectiveReview { id: string; year: "SI129"|"SI130"; hospital: string; wardRaw: string; specialtyId: string|null; overall: Score; extra: Score[]; sections: {label: string; text: string}[]; threeWords: string|null; province: string|null }
export interface HospitalReview { id: string; hospital: string; summary: string|null; scores: Score[]; trackId: string|null; trackRaw: string; specialtyId: string|null; departmentRaw: string }
export type Aliases = Record<"hospital"|"department"|"track", Map<string,string>>;
export function buildAliases(rows: Row[]): Aliases;           // columns kind, from, to; case/space-insensitive
export function isApproved(v: string): boolean;
export function parseScore(v: string, label: string, max: 5|10): Score;
export function parseSI129(rows: Row[], a: Aliases): ElectiveReview[];
export function parseSI130(rows: Row[], a: Aliases): ElectiveReview[];
export function parseHospitals(rows: Row[], a: Aliases): HospitalReview[];
export const SI129_COLUMNS, SI130_COLUMNS, HOSPITAL_COLUMNS, ALIAS_COLUMNS: ColumnSpec[];
```
Column mapping (headers copied from the CSVs):
- SI129: place `สถานที่ไป elective`; if `รพ.ข้างนอก` use `ชื่อรพ`, `จังหวัด`, `วอร์ดที่เลือก`#2, `รีวิวเนื้อหา /สิ่งที่ได้จากวอร์ด /ความว่างหรือเอ้ดมากๆ`, `รีวิวสตาฟ`, `รีวิวที่เที่ยว`, `คะแนนภาพรวม`#2, `อื่นๆ ( ex ห้องพัก, ร้านอาหาร, มีร้านซักผ้าไหม)`; otherwise `วอร์ดที่เลือก`#1, `รีวิวเนื้อหา /สิ่งที่ได้จากวอร์ด/ความว่างหรือเอ้ดมากๆ`, `รีวิวพี่เด้น`, `รีวิวอาจารย์`, `คะแนนภาพรวม`#1, `อื่นๆ`. Overall max 10. Extra: `ควรไป elective ที่นี้ไหม` (max 5). threeWords: `ขอ 3 คำ ให้กับ elective ที่ไปมา`.
- SI130: `ชื่อโรงพยาบาลที่ไป`, `วอร์ดที่เลือก`, overall `ความพึงพอใจในภาพรวม` (5), extra `ได้ความรู้หรือประสบการณ์ใหม่ๆมากเเค่ไหน`, `ความชิล` (5), sections `รีวิวElective`, `ฝากถึงน้องๆที่จะมาElectiveที่นี่`.
- Hospitals: name, summary (`รีวิวภาพรวม…`), the ten score sub-headers, `Pathway/Track ที่มีให้เลือกใช้ทุน`, `ภาควิชา/สาขาวิชาที่มีให้เลือกใช้ทุน`. Rows without a name are skipped. `-` means empty.

`config/aliases.csv` (`kind,from,to`), built from every distinct hospital and ward value in `Data/`:
- hospital: all spellings of ศิริราช (`SI`, `siriraj`, `ศิริรา`, `ศรร`, `รพ.ศิริราช`, …), รามาธิบดี, and merged `รพ./โรงพยาบาล` variants; `รพ แพร่` → `โรงพยาบาลแพร่`.
- department → outline specialty label: all เมด/Med/อายุรศาสตร์ and its subspecialties → อายุรศาสตร์; ศัลย์ variants including CVT, HPB, plastic, neuro, pediatric surgery → ศัลยศาสตร์; Ortho → ออร์โธ; gyne/Ob-gyne/colposcopy/infertility → สูติฯ; จิตเวช variants → จิตเวช; ER/Emer Med → ฉุกเฉิน; ENT, เด็ก, รังสี, นิติเวช, family medicine likewise. Nutrition, palliative care, parasitology, physiology and administrative units stay unmapped. `to` uses the exact label from `SPECIALTIES`.
- track: `จับฉลากใช้ทุน สังกัดกระทรวงสาธารณสุข` → the lottery label; `Fixed สอบบอร์ด`, `Fixed ไม่สอบบอร์ด` → the Fixed Ward กระทรวงสาธารณสุข label.

- [ ] **Step 1:** Failing tests: `isApproved` true for `"yes"," YES "`, false for `"","no","y","yes?"`; `parseScore` gives `null` for `"","-","abc","0","6"` at max 5, and `3` for `" 3 "`; an unapproved row is dropped by all three parsers; an SI129 Siriraj row and outside row both produce the same shape with `overall.max === 10`; `siriraj` → `ศิริราช`; `Med cardio` → `specialtyId "internal-medicine"` with `wardRaw` kept; unmapped ward → `specialtyId null`; hospital track `Fixed สอบบอร์ด` → `trackId "fixed-moph"`; a row object containing a private key never surfaces it; every `to` in `config/aliases.csv` of kind department/track matches a pathway label.
- [ ] **Step 2:** `npm test` → FAIL. Implement.
- [ ] **Step 3:** Tests pass. Commit `feat: parse and normalise reviews`.

### Task 5: Repository and caching

**Files:** Create `src/lib/data/{cache,repository}.ts`. Test: `tests/lib/repository.test.ts`

**Interfaces — Produces:**
```ts
export interface ReviewRepository { getElectiveReviews(): Promise<ElectiveReview[]>; getHospitalReviews(): Promise<HospitalReview[]> }
export function cached<T>(load: () => Promise<T>, ttlMs: number, now?: () => number): () => Promise<T>;
export function createRepository(source: TableSource, opts?: {approveAll?: boolean; ttlMs?: number}): ReviewRepository;
export function getRepository(): ReviewRepository; // from env DATA_SOURCE = "csv" | "sheets"
export function approveAllEnabled(env: Record<string,string|undefined>): boolean;
```

- [ ] **Step 1:** Failing tests: within TTL the loader runs once; after TTL it reloads; a failed reload returns the last good value; a failed first load rejects; `approveAll` shows unmarked rows; `approveAllEnabled` is false in production.
- [ ] **Step 2:** `npm test` → FAIL. Implement; `getRepository` imports `server-only`. CSV file paths are the four files under `Data/` and `config/aliases.csv`; sheets reads aliases from its tab.
- [ ] **Step 3:** Tests pass. Run a one-off check with `approveAll` on the real CSVs: expect 48 + 88 electives and 8 hospital rows; print the unmapped wards and hospitals only, and add any obvious aliases. Commit `feat: review repository with caching`.

### Task 6: Visual kit, site shell and review pages

**Files:**
- Create: `src/components/ui/{Card,Chip,Score,ReviewText}.tsx`, `src/components/reviews/{ElectiveCard,HospitalCard,FilterBar,ElectiveList,HospitalList}.tsx`, `src/lib/filter.ts`, `src/app/(site)/{layout.tsx,error.tsx,electives/page.tsx,hospitals/page.tsx}`
- Test: `tests/lib/filter.test.ts`, `tests/components/ui.test.tsx`

**Interfaces — Produces:**
```ts
export function filterElectives(list: ElectiveReview[], q: {text?: string; hospital?: string; specialtyId?: string; year?: string; sort?: "score"|"hospital"}): ElectiveReview[];
export function filterHospitals(list: HospitalReview[], q: {text?: string; trackId?: string; specialtyId?: string}): HospitalReview[];
<Score score={Score}/>  <ReviewText text={string}/>  <ElectiveCard review/>  <HospitalCard review/>
```
Score sort compares `value / max`, nulls last.

- [ ] **Step 1:** Failing tests: SI129 `8/10` sorts above SI130 `3/5`; null scores last; text search is case-insensitive over hospital, ward and sections; `<Score>` with null renders `–`; `<ReviewText text={"<img src=x>\n\nบรรทัดสอง"}/>` renders no `img` element and has classes `whitespace-pre-wrap break-words`.
- [ ] **Step 2:** `npm test` → FAIL. Implement. Never use `dangerouslySetInnerHTML`.
- [ ] **Step 3:** Shell: wordmark, nav `เส้นทาง · Elective · โรงพยาบาลใช้ทุน`, sign out, report link from `REPORT_URL` (hidden if unset). Pages call `requireStudent()` first and are `dynamic = "force-dynamic"`. Cards use thick ink border, offset shadow, stage color. No match: `ไม่พบรีวิวที่ตรงกัน`; no data: `รอข้อมูล`; `error.tsx`: `โหลดข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง` without error details. The full error, including the name of a missing column, is written to the server log.
- [ ] **Step 4:** Tests and build pass. Commit `feat: review browsing pages`.

### Task 7: Roadmap

**Files:**
- Create: `src/components/roadmap/{Roadmap,StepNode,StepPanel}.tsx`, `src/lib/stepData.ts`, `src/app/(site)/page.tsx` (delete the placeholder `src/app/page.tsx`)
- Test: `tests/lib/stepData.test.ts`, `tests/components/roadmap.test.tsx`

**Interfaces — Produces:**
```ts
export interface StepContent { electives: ElectiveReview[]; hospitals: HospitalReview[] }
export function contentFor(stepId: string, electives: ElectiveReview[], hospitals: HospitalReview[]): StepContent;
export function countByStep(electives: ElectiveReview[], hospitals: HospitalReview[]): Record<string,number>;
```
Rules: `elective` → all electives; `intern` → all hospital rows; a track → its hospital rows; a specialty → both kinds with that `specialtyId`; `extern, graduate, resident, other` and careers → nothing.

- [ ] **Step 1:** Failing tests for each rule; unknown id → both empty; a node with count 0 shows `รอข้อมูล` and a dashed style; each node is a link to `/?step=<id>`; the panel is a labelled `dialog` with a close link to `/`; unknown step renders no panel.
- [ ] **Step 2:** `npm test` → FAIL. Implement. Only the selected step's reviews are passed to the panel. Panel: short Thai description per stage, then cards labelled `Elective` or `ใช้ทุน`; Escape closes; focus moves into the panel and back.
- [ ] **Step 3:** Layout per spec section 4: central spine with side branches from `md` up; single column with collapsible branches below. HTML/CSS/SVG connectors, no diagram library. Hover and open animation disabled under reduced motion.
- [ ] **Step 4:** Tests and build pass. Commit `feat: clickable roadmap`.

### Task 8: Hospital detail page

**Files:** Create `src/app/(site)/hospitals/[name]/page.tsx`, `src/app/(site)/not-found.tsx`, `src/lib/hospitals.ts`. Modify `HospitalCard.tsx` to link there. Test: `tests/lib/hospitals.test.ts`

**Interfaces — Produces:** `hospitalHref(name: string): string`; `reviewsForHospital(param: string, list: HospitalReview[]): {name: string; reviews: HospitalReview[]}|null`

- [ ] **Step 1:** Failing tests: Thai names with spaces and dots round-trip; two rows of one hospital are returned together; unknown name and malformed `%E0%` → `null` (no throw).
- [ ] **Step 2:** `npm test` → FAIL. Implement; page shows ten scores as labelled bars and the written review, `notFound()` on null.
- [ ] **Step 3:** Tests pass. Commit `feat: hospital detail page`.

### Task 9: Setup guide and end-to-end check

**Files:** Create `README.md`; finish `.env.example`.

- [ ] **Step 1:** README: local run (`DATA_SOURCE=csv DEV_APPROVE_ALL=1 AUTH_DEV_BYPASS=1`); Google OAuth client (scopes openid, email, profile; redirect `/api/auth/callback/google`); service account and read-only sheet sharing; sheet tab names, `approved` column and `aliases` tab; Vercel env variables; **test one student account before announcing**.
- [ ] **Step 2:** `npm test && npm run typecheck && npm run build` → all succeed.
- [ ] **Step 3:** `npm start` without bypass: `curl -sI` on `/`, `/electives`, `/hospitals`, `/?step=lottery` → each redirects to `/signin`.
- [ ] **Step 4:** Search `.next/static` and `public/` for a student ID from `Data/` and for a distinctive review phrase → no matches. `git ls-files` lists nothing under `Data/`.
- [ ] **Step 5:** `npm run dev` with the local settings; screenshot roadmap, panel, electives and hospitals at 390px and 1280px; fix overflow, overlap or unreadable contrast. Show the screenshots to the user.
- [ ] **Step 6:** Commit `docs: setup guide`.
