# จบแล้วไปไหน

A roadmap of the paths after medical school, with elective and internship-hospital reviews.
**There is no login: anyone with the web address can read every approved review.**
Google sign-in for Mahidol students can be switched on (see below).

## Preview on your computer (no accounts needed)

```bash
npm install
DATA_SOURCE=csv DEV_APPROVE_ALL=1 npm run dev
```

Open http://localhost:3000. This reads the CSV files in `Data/` and shows unapproved rows.
`DEV_APPROVE_ALL` only works in `npm run dev` with `DATA_SOURCE=csv`.
The preview is reachable only from this computer. Keep it that way: it shows unapproved rows.

## Going live without Google Sheets

```bash
npm run export-data   # Data/*.csv -> Data/cleaned/*.csv -> content/reviews.json
git add content/reviews.json && git commit -m "update reviews" && git push origin build:main
```

The site reads `content/reviews.json` when `DATA_SOURCE` is unset, so Vercel needs no variables (delete any there).

The export never changes your original files. It drops timestamps, rotation codes, student IDs and hospital contacts,
then applies `Data/redactions.tsv` (names and contact details written inside reviews). That list stays on your computer.

**New reviews are not checked automatically.** Read them for names, contacts and accusations, and add lines to
`Data/redactions.tsv` (review id, text to find, replacement; tab-separated) before publishing.
The ids are row positions, so add new responses at the end of each file. Whole reviews can be left out with
`config/exclude.txt`. Everything in `content/reviews.json` is public.

## Going live with Google Sheets

### 1. Google sign-in (optional, off by default)
Skip this section to run without login. To switch it on, set `REQUIRE_LOGIN=1` and do the steps below.

1. In [Google Cloud Console](https://console.cloud.google.com/) create a project.
2. Set up the OAuth consent screen: **External**, scopes `openid`, `email`, `profile`, then publish the app.
3. Create an **OAuth client ID** of type *Web application* with redirect URIs
   `https://YOUR-SITE/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/google`.
4. Copy the client ID and secret into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

**Test with one real student account before announcing the site.** The university may block outside apps.

### 2. The Google Sheet
1. In the same project, enable the **Google Sheets API** and create a **service account** with a JSON key.
2. Make one private sheet with these tabs. Do not use "Publish to web".

| Tab | Content |
|---|---|
| `SI129` | SI129 form responses, headers in row 1 |
| `SI130` | SI130 form responses, headers in row 1 |
| `hospitals` | the hospital review sheet, with its two header rows as they are |
| `aliases` | import `config/aliases.csv` |

3. In `SI129`, `SI130` and `hospitals`, add a column headed `approved` (in `hospitals`, put the heading in the same row as `โรงพยาบาลใช้ทุน`).
4. Share the sheet with the service account email as **Viewer**.

**Only rows with `yes` in `approved` appear.** Before approving a row, read its free text for names of teachers or
other people, and for phone numbers or contact details.

If a form is still collecting, point the tab at the form's response sheet and keep `approved` to the right of the form columns.
Renaming a column heading breaks loading; the server log names the missing column.

New spellings of a hospital or ward go in `aliases` (`kind` is `hospital`, `department` or `track`).
Changes appear within about 10 minutes.

### 3. Vercel
Import the repository and set these variables (see `.env.example`):

`DATA_SOURCE=sheets`,
`SHEET_ID` (from the sheet's address), `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY`
(the `private_key` value from the JSON key) and `REPORT_URL` (so people can ask for a review to be removed).

With login on, also set `REQUIRE_LOGIN=1`, `AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_GOOGLE_ID`,
`AUTH_GOOGLE_SECRET` and optionally `ALLOWED_EMAIL_DOMAINS`.

## Privacy rules built in
- Timestamps, rotation codes, student IDs and hospital contact columns are never requested from the sheet.
- Only approved rows are shown. With login off they are public. `Data/` is not committed.
- Search engines are told not to index the site.

## Development

```bash
npm test
npm run typecheck
npm run build
```

Pathway steps live in `src/config/pathway.ts`. A database can replace the sheet by implementing
`ReviewRepository` in `src/lib/data/repository.ts`.
