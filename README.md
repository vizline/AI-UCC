# AI-UCC

Minimalist web study for the **AI Use Construal & Consequences Scale** wide pilot. Participants are randomly assigned to one of 36 between-subjects cells: 6 scenarios × 3 means (AI / human expert / alone) × 2 perspectives (self / other).

After the vignette appears, a 30-second guided-imagination period must elapse before participants can continue. During measurement, the vignette remains visible in a sticky left-hand panel on desktop, while one construct block at a time appears on the right. Item order is freshly randomised within each block for every participant; blocks retain the A–K protocol order without displaying their construct names.

## Before collecting data

1. Replace the highlighted researcher notice in `index.html` with the ethics-approved participant information.
2. Create a private Google Sheet and import `data/sheet-headers.csv` into its first row. Rename the tab `responses`.
3. In the Sheet choose **Extensions → Apps Script**, paste `google-apps-script/Code.gs`, save, and deploy it as a Web app:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the deployment URL ending in `/exec` and paste it into `CONFIG.endpoint` near the top of `app.js`.
5. Test with dummy responses and confirm that one complete row appears in the Sheet.

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
