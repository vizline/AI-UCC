# Short pilot setup

This is an independent Prolific pilot for scenario S3 (work presentation), with a 2 (SELF / OTHER) × 3 (AI / EXPERT / ALONE) between-subjects design.

## Questionnaire

- Assisted conditions receive all 31 items.
- In the ALONE condition, helper-specific J, K, and A4 items are structurally omitted; all other items remain.
- The full eligible battery is randomised as one item pool for each participant.
- Reverse-keyed raw responses are retained. The receiver calculates all scale scores and the higher-order person-directed penalty.

## Separate Google Sheet and endpoint

1. Create a new blank Google Sheet. Do not use either earlier response workbook.
2. Open **Extensions → Apps Script** and paste `google-apps-script/Code.gs`.
3. Run `setupSheet()` once and approve access.
4. Deploy as a web app: execute as **Me**, access **Anyone**.
5. Paste the new `/exec` deployment URL into `CONFIG.endpoint` at the top of `app.js`.
6. Confirm the Prolific completion code in `CONFIG.prolificCompletionCode`.
7. Test with `?PROLIFIC_PID=TEST&STUDY_ID=TEST&SESSION_ID=TEST` and verify one row plus calculated scores.

The website intentionally downloads a JSON test record instead of transmitting data while `CONFIG.endpoint` is blank.
