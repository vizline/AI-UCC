const SHEET_NAME = 'responses';
const HEADERS = [
  'participant_id','study_version','started_at','completed_at','server_received_at',
  'scenario','means','perspective','age','gender','education','employment','country','native_language',
  'A01','A02','A03','A04','A05_R','A06_R',
  'B01','B02','B03','B04','B05_R',
  'C01','C02','C03','C04_R','C05_R',
  'D01','D02','D03','D04_R',
  'E01','E02','E03','E04_R',
  'F01','F02','F03','F04_R',
  'G01','G02','G03','G04_R','G05_R','G06_R',
  'H01','H02','H03_R','H04_R','H05_R',
  'I01','I02','I03','I04_R','I05_R',
  'J01','J02','J03','J04',
  'K01','K02','K03','K04','contribution',
  'ai_frequency','study_guess','comment','completed',
  'time_consent_sec','time_demographics_sec','time_vignette_sec',
  'time_section_a_sec','time_section_b_sec','time_section_c_sec','time_section_d_sec',
  'time_section_e_sec','time_section_f_sec','time_section_g_sec','time_section_h_sec',
  'time_section_i_sec','time_section_j_sec','time_section_k_sec','time_final_sec','time_total_sec',
  'prolific_pid','prolific_study_id','prolific_session_id'
];

/** Run once from the Apps Script editor before deploying the web app. */
function setupSheet() {
  const workbook = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = workbook.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = workbook.getSheets()[0];
    sheet.setName(SHEET_NAME);
  }
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#eeeeee');
  sheet.getRange('A:A').setNumberFormat('@');
  sheet.getRange('B:B').setNumberFormat('@');
  sheet.getRange('C:E').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(1, 1, 1, HEADERS.length).createFilter();
  return 'AI-UCC response sheet is ready.';
}

/** Safely add new columns after a questionnaire update without deleting responses. */
function upgradeSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Run setupSheet() first');
  const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const expectedPrefix = HEADERS.slice(0, existing.length);
  if (existing.join('|') !== expectedPrefix.join('|')) {
    throw new Error('Existing columns are not in the expected order; no changes were made');
  }
  const missing = HEADERS.slice(existing.length);
  if (!missing.length) return 'Sheet is already up to date.';
  sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]);
  sheet.getRange(1, existing.length + 1, 1, missing.length).setFontWeight('bold').setBackground('#eeeeee');
  sheet.getRange(2, existing.length + 1, Math.max(sheet.getMaxRows() - 1, 1), missing.length).setNumberFormat('0.000');
  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), HEADERS.length).createFilter();
  return missing.length + ' columns added without altering existing responses.';
}

function doGet() {
  return json({ok:true, service:'AI-UCC data receiver', version:'pilot-1.2'});
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse(e.postData.contents);
    if (!data.participant_id || !data.completed_at) throw new Error('Missing required fields');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Run setupSheet() before collecting data');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.join('|') !== HEADERS.join('|')) throw new Error('Response headers do not match this script version');
    const ids = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat() : [];
    if (ids.includes(data.participant_id)) return json({ok:true, duplicate:true});
    data.server_received_at = new Date();
    sheet.appendRow(headers.map(key => Object.prototype.hasOwnProperty.call(data, key) ? sanitise(data[key]) : ''));
    return json({ok:true});
  } catch (error) {
    return json({ok:false, error:String(error.message || error)});
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function sanitise(value) {
  if (typeof value === 'string' && /^[=+\-@]/.test(value)) return "'" + value;
  return value;
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
