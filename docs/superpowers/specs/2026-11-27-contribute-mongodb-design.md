# Contribution forms and MongoDB: Design

Date: 2026-11-27. Status: waiting for approval.
Items marked **(my call)** were not decided by you. Please check them.

## 1. Intent
Make it as easy as possible for people to add experiences to the website, stored in MongoDB, without a developer.

### Goals
- Forms for three things: elective review, hospital review, and a note about another step (Extern, specialties, career paths and so on).
- An approval page. Nothing submitted appears until approved.
- The current reviews moved into MongoDB and shown as before.

### Non-goals
- Editing the guide page or the roadmap structure through a form.
- Contributor accounts, editing your own submission, uploads of images or files.
- Removing the file, CSV or Google Sheets data sources.

### Failure, even if it works
- Anything unapproved is visible to the public.
- A name, phone number or student ID is published because approving did not show it clearly.
- Someone without the password can read pending entries, approve or delete.
- The import loses reviews, duplicates them, or brings back text that was redacted.

## 2. Approaches considered
| Approach | Trade-off | |
|---|---|---|
| 1. Forms and approval page inside this site | Matches the site, clean dropdowns; we maintain it | **chosen by you** |
| 2. Ready-made content system (e.g. Payload) | Admin screens for free; large dependency, public forms still needed | not chosen |
| 3. Google Forms feeding MongoDB | Quickest to change questions; leaves the site, messy names, fragile sync | not chosen |

## 3. Contributing (`/contribute`)
Linked from the top menu as "เพิ่มรีวิว", and from empty step pop-ups with that step preselected **(my call)**. No login.

```
 [ Elective ]  [ โรงพยาบาลใช้ทุน ]  [ เส้นทางอื่น ]
 โรงพยาบาล   [ type, with suggestions ]
 ...
 [x] ไม่มีชื่อบุคคล เบอร์ติดต่อ หรือข้อมูลผู้ป่วย
 [ ส่งรีวิว ]  →  "ได้รับแล้ว รอตรวจสอบ"
```

Fields **(my call)**; * is required:

| Form | Fields |
|---|---|
| Elective | รุ่น* (e.g. SI131), hospital*, department* (list plus อื่นๆ), ward name, overall score*, new knowledge, chill (all 1–5), review*, advice to juniors |
| Hospital | hospital*, track*, department, the 10 existing scores (overall required, others optional), written summary |
| Other step | step* (list), title*, text* |

- Elective uses the SI130 questions and 5-point scale. Imported SI129 reviews keep their 10-point score.
- The รุ่น filter on the elective page lists whatever years exist, instead of only SI129 and SI130.
- Known hospital spellings are normalised with `config/aliases.csv`.
- Errors are shown beside the field and typed text is kept.
- No names or student IDs are collected. The consent box is required.
- Spam protection: hidden trap field, length limits, a per-address hourly limit (addresses stored only as hashes and expired), and a cap on the pending queue.

## 4. Approving (`/admin`) (my call)
- One password from `ADMIN_PASSWORD`. A signed, http-only cookie; failed attempts are rate limited. Every admin action checks it on the server.
- Tabs: pending, approved, rejected. Each entry shows its full text, with likely phone numbers, emails, LINE IDs and titles such as อ./นพ./พญ./พี่ highlighted. Highlighting is an aid, not a guarantee.
- Actions: edit any field, approve, reject, unpublish (for removal requests), delete permanently with a confirmation.
- Pending entries are not announced by email or chat; you check the page.

## 5. Where entries appear
- Elective and hospital reviews: the same pages, cards, filters and roadmap counts as now.
- Notes: in the pop-up of their step, and counted on that step.
- Submission time and any technical data are never shown.
- Changes appear within about a minute.

## 6. Data
- One MongoDB collection of entries: kind (elective, hospital, note), status (pending, approved, rejected), source (import, form), timestamps, and the review in the same shape the pages use today.
- Reading goes through the existing `ReviewRepository`, extended for notes. Writing is a separate small interface. Public reads ask only for approved entries.
- `DATA_SOURCE=mongodb` switches it on. Until then the site works as now, and the contribute and admin pages say they are not available **(my call)**.
- If the database cannot be reached, the last loaded copy is shown, otherwise a plain error. A failed submission says so and keeps the text.

### Migration
- `npm run import-mongo` copies `content/reviews.json` (136 elective, 8 hospital, already redacted) as approved.
- Safe to run again: it adds only missing entries and never overwrites your edits.
- Raw files in `Data/` are not imported.
- The 8 hospital entries come from a file labelled as examples. Check they are real before keeping them.

## 7. Testing
- Automated, without a real database: validation, pending never shown publicly, admin actions refused without the password, import run twice gives the same result, existing pages unchanged.
- Once you provide the settings: import, count 144, submit one of each, approve, see it appear, delete the test entries.

## 8. What I need from you (not needed to start building)
Put these in `.env.local` and in Vercel; do not paste them into chat.
- `MONGODB_URI`, and `MONGODB_DB` (default `joblaew`)
- `ADMIN_PASSWORD` (long, not used elsewhere)
- With MongoDB Atlas: a database user limited to this database, and network access that allows Vercel to connect.

A separate database name for testing is recommended, because a local site with the live settings changes live data.

## 9. Left to the builder
Component layout, exact limits, highlight patterns, MongoDB indexes, caching details, test tooling.
