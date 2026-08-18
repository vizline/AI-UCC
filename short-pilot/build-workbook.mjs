import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = fileURLToPath(new URL("../outputs/", import.meta.url));
const wb = Workbook.create();
const readme = wb.worksheets.add("README");
const responses = wb.worksheets.add("Responses");
const scoring = wb.worksheets.add("Scoring Note");
const codebook = wb.worksheets.add("Codebook");
for (const s of [readme,responses,scoring,codebook]) s.showGridLines=false;

const meta=['participant_id','study_version','started_at','completed_at','server_received_at','scenario','means','perspective','item_order','age','gender','education','employment','country','native_language'];
const items=['J1','J2','J3','J4','K1','K2','K3','K4','G1','G2','G3_R','G4_R','CR1','CR2','CR3_R','A1','A2','A3_R','A4_R','B1','B2','B3_R','C1','C2','C3_R','D1','D2','D3_R','E1','E2','E3_R'];
const finalFields=['ai_frequency','study_guess','comment','completed','time_demographics_sec','time_vignette_sec','time_items_sec','time_final_sec','time_total_sec','prolific_pid','prolific_study_id','prolific_session_id'];
const scores=['score_J','score_K','score_G','score_CR','score_A','score_B','score_C','score_D','score_E','penalty_A','penalty_B','penalty_C','penalty_D','person_penalty'];
const headers=[...meta,...items,...finalFields,...scores];

readme.getRange("A1:F1").merge();
readme.getRange("A1").values=[["Everyday Task Judgments — Short Pilot Data Workbook"]];
readme.getRange("A3:B10").values=[
  ["Purpose","Independent response workbook for the S3 work-presentation pilot."],
  ["Design","2 perspectives (SELF / OTHER) × 3 means (ALONE / EXPERT / AI)."],
  ["Items","31 in assisted conditions; helper-specific J, K, and A4 are structurally missing in ALONE."],
  ["Response scale","1 = strongly disagree; 4 = neither; 7 = strongly agree."],
  ["Reverse coding","For keys ending _R, scored response = 8 − raw response."],
  ["Scale scores","Arithmetic mean of available scored items; raw item columns are never overwritten."],
  ["Penalty score","Mean of penalty_A through penalty_D; higher = harsher person-directed judgment."],
  ["Data collection","The dedicated Apps Script receiver appends raw responses and calculated scores."],
];
readme.getRange("A12:F12").merge();readme.getRange("A12").values=[["Important: use a completely separate Google Sheet and deployment URL for this pilot."]];

responses.getRangeByIndexes(0,0,1,headers.length).values=[headers];
responses.freezePanes.freezeRows(1);responses.freezePanes.freezeColumns(2);

const scaleRows=[
  ["score_J","J1, J2, J3, J4","None","Mean; blank in ALONE","Higher = stronger inspiration/augmentation construal"],
  ["score_K","K1, K2, K3, K4","None","Mean; blank in ALONE","Higher = stronger outsourcing/replacement construal"],
  ["score_G","G1, G2, G3_R, G4_R","G3_R, G4_R","Mean after reverse coding","Higher = greater perceived effort"],
  ["score_CR","CR1, CR2, CR3_R","CR3_R","Mean after reverse coding","Higher = greater perceived creativity"],
  ["score_A","A1, A2, A3_R, A4_R","A3_R, A4_R","Mean available; A4_R absent in ALONE","Higher = greater competence"],
  ["score_B","B1, B2, B3_R","B3_R","Mean after reverse coding","Higher = greater diligence/motivation"],
  ["score_C","C1, C2, C3_R","C3_R","Mean after reverse coding","Higher = greater warmth/character"],
  ["score_D","D1, D2, D3_R","D3_R","Mean after reverse coding","Higher = greater credibility/reliability"],
  ["score_E","E1, E2, E3_R","E3_R","Mean after reverse coding","Higher = greater perceived quality"],
  ["penalty_A","score_A","—","8 − score_A","Higher = harsher competence judgment"],
  ["penalty_B","score_B","—","8 − score_B","Higher = harsher diligence judgment"],
  ["penalty_C","score_C","—","8 − score_C","Higher = harsher character judgment"],
  ["penalty_D","score_D","—","8 − score_D","Higher = harsher credibility judgment"],
  ["person_penalty","penalty_A–penalty_D","—","Mean of four penalty components","Higher = harsher overall person-directed judgment"],
];
scoring.getRange("A1:E1").merge();scoring.getRange("A1").values=[["Scoring specification"]];
scoring.getRange("A3:E3").values=[["Output column","Inputs","Reverse-keyed","Calculation","Interpretation"]];
scoring.getRangeByIndexes(3,0,scaleRows.length,5).values=scaleRows;
scoring.getRange("A20:E22").values=[
  ["Rule","Missing helper items","J, K, and A4_R are not administered in ALONE; do not impute them.","",""],
  ["Rule","Raw preservation","All item columns contain original 1–7 responses.","",""],
  ["Rule","Rounding","Receiver stores calculated scale results to three decimals.","",""],
];

const itemScale=k=>k.startsWith("CR")?"CR":k[0];
const rows=headers.map(h=>{
  let role=meta.includes(h)?"metadata":items.includes(h)?"raw item":finalFields.includes(h)?"administration":"calculated score";
  let type=items.includes(h)||h==="age"||h==="completed"||h.startsWith("time_")||scores.includes(h)?"numeric":"string";
  let note=items.includes(h)?`${itemScale(h)} scale${h.endsWith("_R")?"; reverse-keyed":""}${(["J1","J2","J3","J4","K1","K2","K3","K4","A4_R"].includes(h))?"; not administered in ALONE":""}`:scores.includes(h)?"Calculated by receiver; see Scoring Note":"";
  return [h,role,type,note];
});
codebook.getRange("A1:D1").values=[["Variable","Role","Type","Notes"]];
codebook.getRangeByIndexes(1,0,rows.length,4).values=rows;codebook.freezePanes.freezeRows(1);

const navy="#243447",blue="#DCE6F1",teal="#2F6F6D",light="#F5F7FA",white="#FFFFFF",gold="#F4E4B7";
readme.getRange("A1:F1").format={fill:navy,font:{bold:true,color:white,size:16},rowHeight:30};
readme.getRange("A3:A10").format={fill:blue,font:{bold:true,color:navy},wrapText:true};
readme.getRange("B3:B10").format={fill:light,wrapText:true};
readme.getRange("A12:F12").format={fill:gold,font:{bold:true,color:navy},wrapText:true};
readme.getRange("A1:F12").format.borders={preset:"outside",style:"thin",color:"#B8C2CC"};
readme.getRange("A:A").format.columnWidth=24;readme.getRange("B:B").format.columnWidth=78;

responses.getRangeByIndexes(0,0,1,meta.length).format={fill:navy,font:{bold:true,color:white},wrapText:true};
responses.getRangeByIndexes(0,meta.length,1,items.length).format={fill:teal,font:{bold:true,color:white},wrapText:true};
responses.getRangeByIndexes(0,meta.length+items.length,1,finalFields.length).format={fill:blue,font:{bold:true,color:navy},wrapText:true};
responses.getRangeByIndexes(0,meta.length+items.length+finalFields.length,1,scores.length).format={fill:gold,font:{bold:true,color:navy},wrapText:true};
responses.getRangeByIndexes(0,0,1,headers.length).format.rowHeight=54;
responses.getRangeByIndexes(0,0,1,headers.length).format.columnWidth=15;

scoring.getRange("A1:E1").format={fill:navy,font:{bold:true,color:white,size:16},rowHeight:30};
scoring.getRange("A3:E3").format={fill:teal,font:{bold:true,color:white},wrapText:true};
scoring.getRange("A4:E17").format={fill:light,wrapText:true,borders:{preset:"inside",style:"thin",color:"#D7DEE5"}};
scoring.getRange("A20:B22").format={fill:gold,font:{bold:true,color:navy},wrapText:true};scoring.getRange("C20:E22").format={fill:"#FFF9E8",wrapText:true};
scoring.getRange("A:A").format.columnWidth=20;scoring.getRange("B:C").format.columnWidth=32;scoring.getRange("D:E").format.columnWidth=40;

codebook.getRange("A1:D1").format={fill:navy,font:{bold:true,color:white},wrapText:true};
codebook.getRange(`A2:D${rows.length+1}`).format={wrapText:true,borders:{preset:"inside",style:"thin",color:"#E2E8EE"}};
codebook.getRange("A:A").format.columnWidth=26;codebook.getRange("B:C").format.columnWidth=20;codebook.getRange("D:D").format.columnWidth=58;

await fs.mkdir(outputDir,{recursive:true});
for (const [sheetName,range,file,scale] of [["README","A1:F12","preview-readme.png",1],["Responses",null,"preview-responses.png",0.35],["Scoring Note","A1:E22","preview-scoring.png",1],["Codebook",null,"preview-codebook.png",0.7]]) {
  const options=range?{sheetName,range,scale,format:"png"}:{sheetName,autoCrop:"all",scale,format:"png"};
  const preview=await wb.render(options);
  await fs.writeFile(`${outputDir}/${file}`,new Uint8Array(await preview.arrayBuffer()));
}
const out=await SpreadsheetFile.exportXlsx(wb);
await out.save(`${outputDir}/short-pilot-response-workbook.xlsx`);

console.log((await wb.inspect({kind:"table",range:"Scoring Note!A1:E22",include:"values,formulas",tableMaxRows:25,tableMaxCols:6,maxChars:6000})).ndjson);
console.log((await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:100},summary:"formula error scan"})).ndjson);
