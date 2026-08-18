const SHEET_NAME = 'responses';
const META = ['participant_id','study_version','started_at','completed_at','server_received_at','scenario','means','perspective','item_order','age','gender','education','employment','country','native_language'];
const ITEMS = ['J1','J2','J3','J4','K1','K2','K3','K4','G1','G2','G3_R','G4_R','CR1','CR2','CR3_R','A1','A2','A3_R','A4_R','B1','B2','B3_R','C1','C2','C3_R','D1','D2','D3_R','E1','E2','E3_R'];
const FINAL = ['ai_frequency','study_guess','comment','completed','time_demographics_sec','time_vignette_sec','time_items_sec','time_final_sec','time_total_sec','prolific_pid','prolific_study_id','prolific_session_id'];
const SCORES = ['score_J','score_K','score_G','score_CR','score_A','score_B','score_C','score_D','score_E','penalty_A','penalty_B','penalty_C','penalty_D','person_penalty'];
const HEADERS = [...META,...ITEMS,...FINAL,...SCORES];

/** Run once in a brand-new blank Google Sheet. This creates a separate dataset. */
function setupSheet() {
  const workbook = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = workbook.getSheetByName(SHEET_NAME) || workbook.getSheets()[0];
  sheet.setName(SHEET_NAME);
  sheet.clear();
  sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  sheet.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#DCE6F1');
  sheet.getRange('A:B').setNumberFormat('@');
  sheet.getRange('C:E').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  const scoreStart = HEADERS.indexOf('score_J') + 1;
  sheet.getRange(2,scoreStart,Math.max(sheet.getMaxRows()-1,1),SCORES.length).setNumberFormat('0.000');
  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(1,1,1,HEADERS.length).createFilter();
  return 'Short pilot response sheet is ready.';
}

function doGet() { return json({ok:true,service:'Everyday Task Judgments short-pilot receiver',version:'1.0'}); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse(e.postData.contents);
    if (!data.participant_id || !data.completed_at) throw new Error('Missing required fields');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Run setupSheet() first');
    const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    if (headers.join('|') !== HEADERS.join('|')) throw new Error('Response headers do not match this script version');
    const ids = sheet.getLastRow()>1 ? sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues().flat() : [];
    if (ids.includes(data.participant_id)) return json({ok:true,duplicate:true});
    data.server_received_at = new Date();
    Object.assign(data,calculateScores(data));
    sheet.appendRow(headers.map(key=>Object.prototype.hasOwnProperty.call(data,key)?sanitise(data[key]):''));
    return json({ok:true});
  } catch(error) {
    return json({ok:false,error:String(error.message||error)});
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function calculateScores(d) {
  const mean = keys => {
    const values = keys.map(k=>Number(d[k])).filter(Number.isFinite);
    return values.length ? Number((values.reduce((a,b)=>a+b,0)/values.length).toFixed(3)) : '';
  };
  const scoredMean = specs => {
    const values = specs.map(([k,reverse])=>{
      const v=Number(d[k]); return Number.isFinite(v) ? (reverse?8-v:v) : NaN;
    }).filter(Number.isFinite);
    return values.length ? Number((values.reduce((a,b)=>a+b,0)/values.length).toFixed(3)) : '';
  };
  const scores = {
    score_J:mean(['J1','J2','J3','J4']),
    score_K:mean(['K1','K2','K3','K4']),
    score_G:scoredMean([['G1',0],['G2',0],['G3_R',1],['G4_R',1]]),
    score_CR:scoredMean([['CR1',0],['CR2',0],['CR3_R',1]]),
    score_A:scoredMean([['A1',0],['A2',0],['A3_R',1],['A4_R',1]]),
    score_B:scoredMean([['B1',0],['B2',0],['B3_R',1]]),
    score_C:scoredMean([['C1',0],['C2',0],['C3_R',1]]),
    score_D:scoredMean([['D1',0],['D2',0],['D3_R',1]]),
    score_E:scoredMean([['E1',0],['E2',0],['E3_R',1]])
  };
  ['A','B','C','D'].forEach(x=>scores['penalty_'+x]=scores['score_'+x]===''?'':Number((8-scores['score_'+x]).toFixed(3)));
  scores.person_penalty=meanObject([scores.penalty_A,scores.penalty_B,scores.penalty_C,scores.penalty_D]);
  return scores;
}

function meanObject(values) {
  const valid=values.filter(Number.isFinite);
  return valid.length?Number((valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(3)):'';
}
function sanitise(value) { return typeof value==='string' && /^[=+\-@]/.test(value) ? "'"+value : value; }
function json(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
