# AI-UCC

Minimalist web study for the **AI Use Construal & Consequences Scale** wide pilot. Participants are randomly assigned to one of 36 between-subjects cells: 6 scenarios × 3 means (AI / human expert / alone) × 2 perspectives (self / other).

After the vignette appears, a 30-second guided-imagination period must elapse before participants can continue. During measurement, the vignette remains visible in a sticky left-hand panel on desktop, while one construct block at a time appears on the right. Item order is freshly randomised within each block for every participant; blocks retain the A–K protocol order without displaying their construct names.

## Before collecting data

1. Confirm that the consent and debriefing text in `index.html` matches the final ethics-approved participant information and add a researcher email address if required.
2. Create a private Google Sheet. In the Sheet choose **Extensions → Apps Script** and paste `google-apps-script/Code.gs`.
3. Select `setupSheet` in the function menu and click **Run** once. Approve the requested spreadsheet permission. The script creates the `responses` tab and all columns automatically.
4. Choose **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment URL ending in `/exec` and paste it into `CONFIG.endpoint` near the top of `app.js`.
6. Open the deployment URL in a browser. It should show `{"ok":true,...}`.
7. Test the study with dummy responses and confirm that one complete row appears in the Sheet.

### Updating an existing response sheet

When the questionnaire adds new columns, paste the latest `Code.gs` into Apps Script, select `upgradeSheet`, and click **Run**. This appends missing columns without clearing existing responses. Then edit the existing web-app deployment and deploy a **New version** so the public `/exec` URL uses the updated code.

The spreadsheet must remain private. Never place Google credentials, tokens, participant names, or email addresses in this repository.

## Local preview

Opening `index.html` works for basic review. For a realistic preview run a static server, for example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`. When no Apps Script endpoint is configured, submission downloads a JSON test record instead of transmitting data.

## Data and SPSS

- One completed participant produces one row.
- Conditions are stored in `scenario`, `means`, and `perspective`.
- Reverse-keyed items end in `_R`; raw responses are retained and should be reversed during analysis.
- `data/codebook.csv` documents the variables.
- `data/prepare-data.sps` contains an SPSS starter syntax for reverse scoring.

## Important pilot notes

Random assignment is performed in the browser and is probabilistic, not quota-balanced. Monitor cell counts during recruitment. The consent copy, demographics, attention checks, optional module, withdrawal process, hosting jurisdiction, retention period, and final item order should be approved by the research team and ethics body before launch.
