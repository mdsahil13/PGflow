# PGFlow Apps Script backend

## 1. Create the spreadsheet
Create a Google Spreadsheet for PGFlow and copy its ID from the URL. In Extensions → Apps Script, paste `Code.gs` into the script editor.

In Apps Script → Project Settings → Script Properties, add:
- Property: `SPREADSHEET_ID`
- Value: your spreadsheet ID

Save. In the editor, select `setupSheets` and click Run. Approve Spreadsheet access. The function creates missing sheets and adds headers only to empty sheets; it never clears existing rows. If a non-empty sheet has incompatible headers, it stops with an explicit error. Back up and migrate its header row before trying again.

## 2. Expected headers
The setup function verifies the header names below. Existing rows are not cleared. Keep these exact names (including spaces and capitalization):
- **Students:** `Student ID, Name, Email, Room No, Monthly Rent, Due Date, Payment Status, Reminder Status, Last Reminder, Phone, Move-in Date, Bed ID, Bed Label, Room ID`
- **Properties:** `Property ID, Property Name, Address, City, Total Floors, Status, Created At`
- **Rooms:** `Room ID, Property ID, Floor, Room No, Room Type, Monthly Rent, Status, Created At`
- **Beds:** `Bed ID, Property ID, Room ID, Room No, Bed Label, Status, Student ID, Updated At`
- **Settings** (or existing tab named `Setting`): `PG name, Reminder date, Owner email`
- **Automation Logs:** `Timestamp, Student ID, Name, Email, Action, Status, Reminder, Type, Details`

The backend translates these sheet headers to the frontend's camelCase fields. It does not add internal-only columns. Since the Students sheet has no Property ID column, the property's ID/name is derived from its selected Room or Bed. The Room Type determines bed capacity (for example, `Double Sharing` allows two beds). The bed rent is derived from its room's Monthly Rent. Student Notes, property owner/phone/notes, and other fields not present in the supplied schema are not stored in the sheet.

## 3. Deploy as a Web App
1. Click **Deploy → New deployment**.
2. Select **Web app**.
3. Execute as **Me** so the script can access the configured Sheet and send authorized reminder emails.
4. Choose who can access it. **Anyone** (if available for your account) makes the endpoint publicly callable and can expose tenant data or permit destructive actions to anyone who obtains the URL. Use only with non-sensitive test data unless you add authentication/authorization or a trusted proxy. Organization-only access may block external frontend users.
5. Deploy, authorize requested scopes, and copy the Web App URL ending in `/exec`.
6. For code changes, create a new version and update the deployment. A test `/dev` URL is not the production endpoint.

The endpoint URL is not a secret or an access-control mechanism. This baseline does not implement user login, role-based authorization, or signed requests. Do not use it for sensitive production tenant records with public access without adding a security layer.

## 4. Connect the frontend
At the root of the frontend, copy `.env.example` to `.env` and set:
```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```
This value is compiled into browser JavaScript. Never put a password, private API key, or other credential in it. Restart `npm run dev` after editing.

## 5. Email reminders
Run `setupDailyTrigger()` once from the Apps Script editor and approve trigger/email permissions. It removes duplicate triggers for `runAutomation` and creates a daily trigger around 9 AM in the script's timezone. Verify Project Settings → Time zone first. Apps Script trigger execution is approximate, not an exact clock guarantee.

The automation sends reminders only on the due date and exactly three days after it, skips PAID tenants and missing emails, writes a reminder timestamp, and records outcomes in Automation Logs. Duplicate successful reminders for the same student/date/reminder key are skipped. Check Apps Script Executions and Automation Logs for failures. Google account quotas and Gmail authorization apply.

## 6. Verify a real write
1. Open `/exec?action=health` in a browser. It should return JSON with `success: true`.
2. Open PGFlow and check the dashboard. A health response alone does not verify writes.
3. Add a test student using the Students page and submit the form.
4. Open the actual `Students` sheet and confirm a new row exists with generated `STU-...` ID and values under the matching visible headers (`Student ID`, `Name`, `Phone`, `Move-in Date`, `Monthly Rent`, and `Due Date`).
5. Edit the same student and confirm the same row changes rather than a second row being added. Test Mark Paid only with a test record.
6. Confirm beds change between `VACANT` and `OCCUPIED` after assignment/vacating.

## Troubleshooting
- **Missing sheet / headers:** run `setupSheets`; compare exact header spelling. Never wipe the sheet as a quick fix.
- **Wrong column values:** use the exact schema above. `Phone`, `Move-in Date`, `Bed ID`, `Bed Label`, and `Monthly Rent` are separate fields; do not rename headers without updating the backend mapping.
- **Permissions:** verify the deployment executes as the intended account, re-authorize after adding MailApp use, and check Executions.
- **CORS / redirect / invalid JSON:** Apps Script may redirect to a Google-hosted URL that browser fetch cannot consume in every deployment context. The client reports this; it does not claim success. Use a small authenticated same-origin proxy if needed and configure the frontend to call it.
- **HTTP 401/403:** check Web App audience/access settings and deployment version.
- **Failed write:** the UI shows backend errors; check Apps Script Executions and the spreadsheet's edit permissions.
