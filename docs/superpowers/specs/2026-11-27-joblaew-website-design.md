# จบแล้วไปไหน — Website Design

Date: 2026-11-27. Status: waiting for approval.
Items marked **(my call)** were not decided by you. Please check them.

## 1. Intent

A playful, modern website that lets Mahidol students see the paths a medical student can take and read the information about each step easily. The centrepiece is a roadmap.sh-style pathway.

**Success (my call):** a student signs in on a phone, finds a step or hospital, and reads its reviews within a few taps.

### Goals
- A clickable pathway from elective to career.
- Easy access to review data (browse, search, filter).
- A new playful visual identity.
- Only Mahidol student accounts can read anything.
- Data can be added without code, and a database can replace Google Sheets later.

### Non-goals for version 1 (my call)
- Writing or editing reviews on the website, or an admin page.
- Saving personal progress on the pathway.
- Alumni access.
- Dark mode, and a full English version.

### Failure, even if it works
- Student IDs, hospital staff contacts or unapproved rows reach a browser.
- Someone outside the two student domains reads a review.
- The empty parts of the pathway make the site look broken.
- The pathway is awkward to use on a phone.

## 2. Constraints
- Next.js (App Router), TypeScript, Tailwind CSS.
- Data source now: Google Sheets. Later: a database.
- Sign-in: Google only.
- Hosting: Vercel.

## 3. Approaches considered

**Sign-in**
| Option | Trade-off | |
|---|---|---|
| A. Emailed 6-digit code (Supabase) | Works with any mail provider; needs an email-sending service | not chosen |
| B. Google sign-in button | One click, no database; the university could block outside apps | **chosen by you** |

**New data**
| Option | Trade-off | |
|---|---|---|
| Google Sheets as source | No code to add data; one-time access setup | **chosen by you**, database later |
| CSV files in the project | Simplest; every update needs a developer | not chosen |
| Submit and approve on the site | Smoothest; much more to build | not chosen |

## 4. The pathway

```
        ● Elective          SI129 / SI130 reviews
        │
        ● Extern            no data yet
        │
        ★ จบแล้วไปไหน?
        │
        ● ใช้ทุน / Intern ──── 6 tracks ──── hospital reviews
        │
        ◆ choose
      ┌─┴──────────────┐
  Resident          เส้นทางอื่น
  18 specialties    14 careers
```

- The outline lists the 6 tracks under "แพทย์เฉพาะทาง". **(my call)** All paths pass through ใช้ทุน/intern and then split into resident or other careers.
- Tracks, specialties and other careers come from your outline CSV, with the same names. They live in one config file in the code **(my call)**.
- Vertical spine with side branches on desktop; one column with collapsible branches on phones. Built with HTML/SVG, no diagram library.
- Clicking a step opens a pop-up in the middle of the screen with a summary and its reviews (changed 2026-11-27 from a side panel, at your request). Each step has its own link that can be shared.
- Steps with data show a count. Empty steps look deliberately unfinished (dashed, "รอข้อมูล") and say so when opened.

## 5. Pages (my call)

| Page | Content |
|---|---|
| Sign-in | Name, one line about the project, Google button, clear message if the account is not allowed |
| Pathway (home) | The roadmap |
| Elective reviews | Cards; search; filter by hospital, department, SI year; sort by score |
| ใช้ทุน hospitals | Cards with the 10 scores; filter by track and department; detail view with written review |

There is no written content for specialties or careers yet, so none will be invented. **(my call)** A specialty panel shows hospital reviews and elective reviews whose department maps to it (e.g. Med cardio → อายุรศาสตร์), each clearly labelled. Career panels show "รอข้อมูล".

## 6. Look (my call)
- Playful but readable: warm off-white background, dark ink text, and one bright color per stage (violet elective, sky extern, sunflower graduation, coral intern, mint resident, pink other).
- Rounded cards with thick outlines and offset shadows; small hover and open animations that respect "reduce motion".
- Thai fonts: a rounded display face (Mali) for headings and IBM Plex Sans Thai for reading.
- Interface text in Thai, keeping medical terms in English where students use them.
- Keyboard usable and readable contrast. No logo or mascot beyond a simple wordmark.

## 7. Sign-in and privacy
- Auth.js with the Google provider; session stored in a signed cookie, no database.
- The server accepts only verified emails whose domain is exactly `student.mahidol.edu` or `student.mahidol.ac.th`. The list is a setting.
- This admits any Mahidol student, not only medical students.
- Every page and data request is checked on the server. Review data is never in public files. Search engines are told not to index.
- The server reads only a fixed list of columns. Student ID and hospital contact columns are never on that list.
- **(my call)** Reviewer timestamps and rotation codes are not shown, because together with a ward they could identify the writer. Only the SI year is shown.
- Free text can name teachers and senior doctors. The approval step is where a person checks this; the site does not detect names.
- **(my call)** A "report or remove a review" link, pointing to an address or form you provide.
- The `Data/` folder and all secrets are excluded from git.

## 8. Data

- A **private** Google Sheet, shared read-only with a service account. It is not "published to the web".
- Tabs: SI129 responses, SI130 responses, hospital reviews, and `aliases`.
- Each review tab gets an `approved` column. **(my call)** Only rows marked `yes` are shown, including the existing 136 elective responses, so someone must review them before launch.
- `aliases` maps spellings to one name, e.g. "SI", "siriraj", "ศิริรา" → ศิริราช, and the many ward spellings → one department. I will draft it from the current data for you to check. Unmapped values show as written.
- SI129 has separate column sets for Siriraj and outside hospitals; both become one review shape. Its overall score is out of 10 and SI130's are out of 5, so each is shown on its own scale.
- The hospital sheet holds 8 example rows. **(my call)** They are shown only if marked approved. "รพ แพร่" and "โรงพยาบาลแพร่" are treated as one hospital.
- Changes appear within about 10 minutes. If the sheet cannot be read, the site shows the last good copy or a plain error, never partial private columns.
- The hospital sheet's two-row header is kept as is. Its short values are mapped through `aliases` (e.g. "Ortho", "Med"). **(my call)** "Fixed สอบบอร์ด / ไม่สอบบอร์ด" is taken to mean the กระทรวงสาธารณสุข Fixed Ward track, since the sheet does not say.
- A missing or renamed column produces a clear error naming it.
- All reading goes through one interface with two implementations: Google Sheets, and local CSV for development and testing. A database becomes a third later.

## 9. Testing
- Automated: domain check, approval filter, private columns never in output, alias mapping, parsing both SI layouts, signed-out requests refused.
- Manual: phone and desktop layouts, and **one real student account signing in early**. If the university blocks it, we return to approach A.

## 10. What I need from you (not needed to start building)
1. A Google Cloud project for the sign-in credentials and service account (I will give steps).
2. The Google Sheet.
3. A Vercel account.
4. The report/removal address.
5. Confirmation that the review owners are happy for these to be shown to students.

## 11. Left to the builder
Component structure, exact color values and spacing, animation details, caching mechanics, test tooling.
