# จบแล้วไปไหน

A roadmap of the paths after medical school, with elective and internship-hospital reviews.
Only Mahidol student Google accounts can read it.

## Preview on your computer (no accounts needed)

```bash
npm install
DATA_SOURCE=csv DEV_APPROVE_ALL=1 AUTH_DEV_BYPASS=1 npm run dev
```

Open http://localhost:3000. This reads the CSV files in `Data/`, shows unapproved rows and skips sign-in.
Both switches only work in `npm run dev` with `DATA_SOURCE=csv`.
The preview is reachable only from this computer. Keep it that way: it has no sign-in.

## Going live

### 1. Google sign-in
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

`AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `DATA_SOURCE=sheets`,
`SHEET_ID` (from the sheet's address), `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY`
(the `private_key` value from the JSON key), and optionally `ALLOWED_EMAIL_DOMAINS` and `REPORT_URL`.

## Privacy rules built in
- Timestamps, rotation codes, student IDs and hospital contact columns are never requested from the sheet.
- Review data is rendered on the server for signed-in students only. `Data/` is not committed.
- Search engines are told not to index the site.

## Development

```bash
npm test
npm run typecheck
npm run build
```

Pathway steps live in `src/config/pathway.ts`. A database can replace the sheet by implementing
`ReviewRepository` in `src/lib/data/repository.ts`.
