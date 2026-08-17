const SHEET_NAME = 'responses';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse(e.postData.contents);
    if (!data.participant_id || !data.completed_at) throw new Error('Missing required fields');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet "responses" not found');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const ids = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat() : [];
    if (ids.includes(data.participant_id)) return json({ok:true, duplicate:true});
    sheet.appendRow(headers.map(key => Object.prototype.hasOwnProperty.call(data, key) ? sanitise(data[key]) : ''));
    return json({ok:true});
  } catch (error) {
    return json({ok:false, error:String(error.message || error)});
  } finally {
    lock.releaseLock();
  }
}

function sanitise(value) {
  if (typeof value === 'string' && /^[=+\-@]/.test(value)) return "'" + value;
  return value;
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
