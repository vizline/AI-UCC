"use strict";

const CONFIG = {
  endpoint: "", // Paste the deployed Google Apps Script /exec URL here.
  studyVersion: "pilot-1.0",
  saveDrafts: true
};

const scenarios = {
  S1:{task:"prepare a complicated annual tax declaration",expert:"a tax advisor"},
  S2:{task:"write a heartfelt condolence message to a close friend whose parent has just died",expert:"a friend who is good with words"},
  S3:{task:"prepare the slides and talking points for an important work presentation",expert:"a professional presentation consultant"},
  S4:{task:"write a graded university essay for their course",selfTask:"write a graded university essay for your course",expert:"a private tutor"},
  S5:{task:"create a personal birthday gift — a short poem or an illustration — for someone they love",selfTask:"create a personal birthday gift — a short poem or an illustration — for someone you love",expert:"a professional artist or writer they commission",selfExpert:"a professional artist or writer you commission"},
  S6:{task:"write a difficult email pushing back on a colleague who treated them unfairly",selfTask:"write a difficult email pushing back on a colleague who treated you unfairly",expert:"a trusted mentor"}
};

const universal = [
  ["A01","This person is genuinely skilled at this kind of task.","I am genuinely skilled at this kind of task."],
  ["A02","This person clearly knows what they are doing.","I clearly know what I am doing."],
  ["A03","This person could produce work of this standard on their own.","I could produce work of this standard on my own."],
  ["A04","This person is capable and effective.","I am capable and effective."],
  ["A05_R","This person lacks the competence to handle this task properly.","I lack the competence to handle this task properly."],
  ["B01","This person is willing to put in real work when it matters.","I am willing to put in real work when it matters."],
  ["B02","This person is hard-working.","I am hard-working."],
  ["B03","This person cares about doing things properly.","I care about doing things properly."],
  ["B04","This person is motivated to do a good job.","I am motivated to do a good job."],
  ["B05_R","This person is the type to cut corners.","I am the type to cut corners."],
  ["C01","This person is sincere.","I am sincere."],
  ["C02","This person is warm and genuine.","I am warm and genuine."],
  ["C03","This person is someone of good character.","I am someone of good character."],
  ["C04_R","This person comes across as cold or impersonal.","I come across as cold or impersonal."],
  ["C05_R","This person treats this as a purely transactional matter.","I treat this as a purely transactional matter."],
  ["D01","This person's expertise here is credible.","My expertise here is credible."],
  ["D02","This person's work can be depended on.","My work can be depended on."],
  ["D03","This person can be taken at their word here.","I can be taken at my word here."],
  ["D04_R","The reliability of this person's work is questionable.","The reliability of my work is questionable."],
  ["E01","The work this person produced is high quality.","The work I produced is high quality."],
  ["E02","This person's result is impressive.","My result is impressive."],
  ["E03","This person's work is technically well done.","My work is technically well done."],
  ["E04_R","This person's final product falls short.","My final product falls short."],
  ["F01","This work genuinely reflects who this person is.","This work genuinely reflects who I am."],
  ["F02","This is really this person's own voice.","This is really my own voice."],
  ["F03","What this person made feels authentic.","What I made feels authentic."],
  ["F04_R","The result feels manufactured rather than real.","The result feels manufactured rather than real."],
  ["G01","This person put real effort into this.","I put real effort into this."],
  ["G02","Getting this done still demanded genuine effort from this person.","Getting this done still demanded genuine effort from me."],
  ["G03","This person invested serious mental effort here.","I invested serious mental effort here."],
  ["G04_R","This person took the easy way out.","I took the easy way out."],
  ["G05_R","This person skipped the hard part.","I skipped the hard part."],
  ["G06_R","This person was lazy about this.","I was lazy about this."],
  ["H01","The way this person handled this is completely acceptable.","The way I handled this is completely acceptable."],
  ["H02","This person did nothing wrong here.","I did nothing wrong here."],
  ["H03_R","There is something dishonest about doing it this way.","There is something dishonest about doing it this way."],
  ["H04_R","This amounts to a kind of cheating.","This amounts to a kind of cheating."],
  ["H05_R","This approach is unfair to others who do it the hard way.","This approach is unfair to others who do it the hard way."]
];

const helpOnly = [
  ["A06_R","Whatever ability is on display here really belongs to {help}, not to this person.","Whatever ability is on display here really belongs to {help}, not to me."],
  ["I01","The credit for this belongs mostly to this person, not to {help}.","The credit for this belongs mostly to me, not to {help}."],
  ["I02","This person, not {help}, is the real author of this.","I, not {help}, am the real author of this."],
  ["I03","This person's own contribution here was substantial.","My own contribution here was substantial."],
  ["I04_R","Most of what makes this good came from {help}.","Most of what makes this good came from {help}."],
  ["I05_R","{Help} did the real work; this person mainly supervised.","{Help} did the real work; I mainly supervised."],
  ["J01","{Help} gave this person a starting point that they then built on.","{Help} gave me a starting point that I then built on."],
  ["J02","This person used {help} to sharpen their own thinking.","I used {help} to sharpen my own thinking."],
  ["J03","{Help} served mainly as a source of inspiration for this person.","{Help} served mainly as a source of inspiration for me."],
  ["J04","This person stayed in control and used {help} as support.","I stayed in control and used {help} as support."],
  ["K01","This person handed the real work over to {help}.","I handed the real work over to {help}."],
  ["K02","{Help} did the thinking and this person just collected the result.","{Help} did the thinking and I just collected the result."],
  ["K03","This person used {help} to avoid doing the task themselves.","I used {help} to avoid doing the task myself."],
  ["K04","This person let {help} replace their own effort.","I let {help} replace my own effort."]
];

const app = document.querySelector("#app");
const progressLabel = document.querySelector("#progressLabel");
let state = {participantId:crypto.randomUUID(),startedAt:null,condition:null,demographics:{},responses:{},page:0};

function condition(){
  const keys=Object.keys(scenarios), means=["AI","EXPERT","ALONE"], perspectives=["SELF","OTHER"];
  return {scenario:keys[Math.floor(Math.random()*keys.length)],means:means[Math.floor(Math.random()*3)],perspective:perspectives[Math.floor(Math.random()*2)]};
}
function saveLocal(){if(CONFIG.saveDrafts) localStorage.setItem("aiucc-draft",JSON.stringify(state));}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function setProgress(current,total=5){progressLabel.textContent=String(current).padStart(2,"0")+" / "+String(total).padStart(2,"0");}
function renderIntro(){setProgress(0);app.replaceChildren(document.querySelector("#introTemplate").content.cloneNode(true));const c=document.querySelector("#consentCheck"),b=document.querySelector("#startButton");c.onchange=()=>b.disabled=!c.checked;b.onclick=()=>{state.startedAt=new Date().toISOString();state.condition=condition();state.page=1;saveLocal();renderDemographics();};}
function renderDemographics(){setProgress(1);app.innerHTML=`<section class="panel"><p class="section-code">01 / Background</p><h1>First, a little about you.</h1><p class="instruction">Please answer the following questions. You may select “Prefer not to say” where available.</p><form id="demoForm" class="form-grid">
  ${field("age","Age","number","",'min="18" max="100" required')}
  ${select("gender","Gender",["Woman","Man","Non-binary","Self-describe","Prefer not to say"],true)}
  ${select("education","Highest level of education completed",["Primary or lower secondary","Upper secondary","Vocational qualification","Bachelor’s degree","Master’s degree","Doctoral degree","Other","Prefer not to say"],true)}
  ${select("employment","Current employment status",["Employed full-time","Employed part-time","Self-employed","Student","Not currently employed","Retired","Other","Prefer not to say"],true)}
  ${field("country","Country of residence","text","e.g. Poland","required autocomplete=\"country-name\"")}
  ${field("native_language","First language","text","e.g. Polish","required")}
  <div class="actions field full"><button type="submit" class="button primary">Continue <span>→</span></button></div></form></section>`;
  document.querySelector("#demoForm").onsubmit=e=>{e.preventDefault();state.demographics=Object.fromEntries(new FormData(e.target));state.page=2;saveLocal();renderVignette();};}
function field(name,label,type,placeholder,extra=""){return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" ${extra}></div>`;}
function select(name,label,options,required=false){return `<div class="field"><label for="${name}">${label}</label><select id="${name}" name="${name}" ${required?"required":""}><option value="">Select an option</option>${options.map(x=>`<option>${x}</option>`).join("")}</select></div>`;}
function vignetteText(){const c=state.condition,s=scenarios[c.scenario],self=c.perspective==="SELF";const task=self?(s.selfTask||s.task.replaceAll("their","your").replaceAll("them","you")):s.task;let means;if(c.means==="AI")means="with the help of an AI tool (such as ChatGPT)";else if(c.means==="EXPERT")means=`with the help of ${self?(s.selfExpert||s.expert):s.expert}`;else means=self?"entirely on your own, without any help":"entirely on their own, without any help";return self?`Imagine that you need to ${task}. You complete it ${means}.`:`Imagine you observe someone — an ordinary person, much like you — who needs to ${task}. They complete it ${means}.`;}
function renderVignette(){setProgress(2);app.innerHTML=`<section class="panel"><p class="section-code">02 / Situation</p><h1>Imagine the following situation.</h1><div class="vignette">${escapeHtml(vignetteText())}</div><p class="instruction">Take a moment to picture the situation. On the next pages, respond based only on the information provided.</p><div class="actions"><button class="button primary" id="toItems">Continue <span>→</span></button></div></section>`;document.querySelector("#toItems").onclick=()=>{state.page=3;saveLocal();renderItems("universal");};}
function helpLabel(cap=false){let h=state.condition.means==="AI"?"the AI":scenarios[state.condition.scenario].expert;return cap?h.charAt(0).toUpperCase()+h.slice(1):h;}
function itemText(item){const raw=item[state.condition.perspective==="SELF"?2:1];return raw.replaceAll("{help}",helpLabel()).replaceAll("{Help}",helpLabel(true));}
function scaleItem(item){return `<div class="question" data-item="${item[0]}"><p class="question-text">${escapeHtml(itemText(item))}</p><div class="scale" role="radiogroup" aria-label="Agreement scale">${[1,2,3,4,5,6,7].map(n=>`<label><input type="radio" name="${item[0]}" value="${n}" required><span>${n}</span></label>`).join("")}</div><div class="anchors"><span>Strongly disagree</span><span>Neither</span><span>Strongly agree</span></div></div>`;}
function renderItems(type){const isHelp=type==="help";setProgress(isHelp?4:3);const items=isHelp?helpOnly:universal;app.innerHTML=`<section class="panel"><p class="section-code">${isHelp?"04":"03"} / Your assessment</p><h1>${isHelp?"Now consider the role of the help received.":"How do you see this situation?"}</h1><p class="instruction">Indicate how strongly you agree or disagree with each statement.</p><form id="itemsForm" class="item-list">${items.map(scaleItem).join("")}${isHelp?sliderItem():""}<div id="formError"></div><div class="actions"><button type="submit" class="button primary">${isHelp?"Continue":"Next"} <span>→</span></button></div></form></section>`;
  const slider=document.querySelector("#contribution");if(slider)slider.oninput=()=>document.querySelector("#sliderValue").value=slider.value;
  document.querySelector("#itemsForm").onsubmit=e=>{e.preventDefault();const missing=[...e.target.querySelectorAll(".question")].filter(q=>!q.querySelector("input:checked")&&!q.querySelector('input[type="range"]'));if(missing.length){document.querySelector("#formError").innerHTML=`<div class="error-summary">Please answer every statement before continuing.</div>`;missing[0].scrollIntoView({behavior:"smooth",block:"center"});return;}Object.assign(state.responses,Object.fromEntries(new FormData(e.target)));if(!isHelp&&state.condition.means!=="ALONE"){state.page=4;saveLocal();renderItems("help");}else{state.page=5;saveLocal();renderFinal();}};}
function sliderItem(){return `<div class="question"><p class="question-text">Of the total contribution to the final result, what share came from ${state.condition.perspective==="SELF"?"you":"the person"}, and what share came from ${escapeHtml(helpLabel())}?</p><div class="slider-wrap"><span>0</span><input id="contribution" name="contribution" type="range" min="0" max="100" value="50"><output id="sliderValue">50</output></div><div class="slider-ends"><span>None from ${state.condition.perspective==="SELF"?"you":"person"}</span><span>All from ${state.condition.perspective==="SELF"?"you":"person"}</span></div></div>`;}
function renderFinal(){setProgress(5);app.innerHTML=`<section class="panel"><p class="section-code">05 / Final questions</p><h1>Almost finished.</h1><form id="finalForm" class="form-grid">${select("ai_frequency","How often do you use generative AI tools such as ChatGPT?",["Never","Less than monthly","Monthly","Weekly","Several times a week","Daily or almost daily"],true)}${select("study_guess","What do you think this study was mainly about?",["Evaluations of work and the people who produce it","Memory for written information","Preferences for different kinds of tasks","I am not sure","Other"],true)}<div class="field full"><label for="comment">Optional comments</label><input id="comment" name="comment" type="text" maxlength="500"><span class="hint">Do not include your name or other identifying information.</span></div><div class="actions field full"><button type="submit" class="button primary">Submit responses <span>→</span></button></div></form></section>`;document.querySelector("#finalForm").onsubmit=async e=>{e.preventDefault();Object.assign(state.responses,Object.fromEntries(new FormData(e.target)));await submitData(e.target.querySelector("button"));};}
async function submitData(button){button.disabled=true;button.textContent="Submitting…";const payload={participant_id:state.participantId,study_version:CONFIG.studyVersion,started_at:state.startedAt,completed_at:new Date().toISOString(),scenario:state.condition.scenario,means:state.condition.means,perspective:state.condition.perspective,...state.demographics,...state.responses,completed:1};try{if(!CONFIG.endpoint){downloadFallback(payload);renderThanks(true);return;}const res=await fetch(CONFIG.endpoint,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});if(!res.ok)throw new Error("Save failed");const out=await res.json();if(!out.ok)throw new Error(out.error||"Save failed");localStorage.removeItem("aiucc-draft");renderThanks(false);}catch(err){button.disabled=false;button.textContent="Try submitting again →";document.querySelector("#finalForm").insertAdjacentHTML("beforeend",`<div class="error-summary field full">We could not save your responses. Please check your connection and try again.</div>`);}}
function downloadFallback(payload){const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`AI-UCC-${state.participantId}.json`;a.click();URL.revokeObjectURL(a.href);}
function renderThanks(demo){setProgress(5);localStorage.removeItem("aiucc-draft");app.innerHTML=`<section class="status-card panel"><div class="status-mark">✓</div><p class="section-code">Study complete</p><h1>Thank you for taking part.</h1><p class="lede">Your responses ${demo?"were downloaded as a local test file because data collection has not yet been connected":"have been recorded"}. This study examines whether receiving AI or human help changes how people evaluate a person, their work, and their effort.</p><p class="instruction">You may now close this page.</p></section>`;}
renderIntro();
