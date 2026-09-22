const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let currentText=localStorage.getItem("lmv-current")||"";
let sentences=[], sentenceIndex=0, speaking=false;
const settings=JSON.parse(localStorage.getItem("lmv-settings")||'{"font":"xlarge","speed":0.75}');
document.body.dataset.font=settings.font||"xlarge";

function show(id){speechSynthesis.cancel(); speaking=false; $$(".screen").forEach(x=>x.classList.remove("active")); $("#"+id).classList.add("active"); if(id==="saved") renderSaved(); if(id==="reader"){ $("#textArea").value=currentText; } window.scrollTo(0,0);}
$$("[data-go]").forEach(b=>b.onclick=()=>show(b.dataset.go));
$("#photoBtn").onclick=()=>show("scan"); $("#newPhotoBtn").onclick=()=>show("scan");
$("#cameraBtn").onclick=()=>$("#cameraInput").click(); $("#galleryBtn").onclick=()=>$("#galleryInput").click();
$("#cameraInput").onchange=e=>handleImage(e.target.files[0]); $("#galleryInput").onchange=e=>handleImage(e.target.files[0]);

async function handleImage(file){
 if(!file)return;
 $("#scanError").classList.add("hidden"); $("#ocrBox").classList.remove("hidden"); $("#ocrProgress").value=2; $("#ocrStatus").textContent="Texterkennung wird vorbereitet.";
 try{
   if(!window.Tesseract) throw new Error("OCR nicht geladen");
   const result=await Tesseract.recognize(file,"deu",{logger:m=>{
     if(m.progress!=null) $("#ocrProgress").value=Math.round(m.progress*100);
     if(m.status==="loading language traineddata") $("#ocrStatus").textContent="Deutsche Sprachdaten werden geladen …";
     else if(m.status==="recognizing text") $("#ocrStatus").textContent="Text wird erkannt …";
   }});
   const txt=(result.data.text||"").replace(/\n{3,}/g,"\n\n").trim();
   if(txt.length<3) throw new Error("kein Text");
   currentText=txt; localStorage.setItem("lmv-current",txt); $("#homeReadBtn").disabled=false; $("#ocrBox").classList.add("hidden"); show("reader");
 }catch(e){
   $("#ocrBox").classList.add("hidden"); $("#scanError").textContent="Der Text konnte leider nicht erkannt werden. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es mit einem neuen, gut beleuchteten Foto."; $("#scanError").classList.remove("hidden");
 }
}

function splitSentences(text){
 const m=text.replace(/\s+/g," ").trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g);
 return (m||[]).map(s=>s.trim()).filter(Boolean);
}
function germanVoice(){
 const vs=speechSynthesis.getVoices();
 return vs.find(v=>v.lang?.toLowerCase().startsWith("de"))||vs[0];
}
function speakFrom(index=0){
 currentText=$("#textArea").value.trim(); if(!currentText)return;
 sentences=splitSentences(currentText); if(!sentences.length)return;
 sentenceIndex=Math.max(0,Math.min(index,sentences.length-1)); speechSynthesis.cancel(); speaking=true; speakOne();
}
function speakOne(){
 if(!speaking||sentenceIndex>=sentences.length){speaking=false;return;}
 const u=new SpeechSynthesisUtterance(sentences[sentenceIndex]); u.lang="de-DE"; u.rate=Number(settings.speed||.75); const v=germanVoice(); if(v)u.voice=v;
 u.onend=()=>{if(speaking){sentenceIndex++;speakOne();}}; u.onerror=()=>{speaking=false;};
 speechSynthesis.speak(u);
}
$("#readBtn").onclick=()=>speakFrom(0);
$("#homeReadBtn").onclick=()=>{show("reader"); setTimeout(()=>speakFrom(0),100)};
$("#pauseBtn").onclick=()=>speechSynthesis.pause();
$("#resumeBtn").onclick=()=>speechSynthesis.resume();
$("#stopBtn").onclick=()=>{speaking=false;speechSynthesis.cancel()};
$("#prevBtn").onclick=()=>{if(!sentences.length)sentences=splitSentences($("#textArea").value);speakFrom(Math.max(0,sentenceIndex-1))};
$("#nextBtn").onclick=()=>{if(!sentences.length)sentences=splitSentences($("#textArea").value);speakFrom(Math.min(sentences.length-1,sentenceIndex+1))};
$("#textArea").oninput=e=>{currentText=e.target.value;localStorage.setItem("lmv-current",currentText);$("#homeReadBtn").disabled=!currentText.trim();};

function getSaved(){try{return JSON.parse(localStorage.getItem("lmv-saved")||"[]")}catch{return[]}}
function setSaved(a){localStorage.setItem("lmv-saved",JSON.stringify(a))}
$("#saveBtn").onclick=()=>{
 const text=$("#textArea").value.trim(); if(!text)return;
 const suggested=text.replace(/\s+/g," ").slice(0,45);
 const title=prompt("Wie soll der Text heißen?",suggested)||suggested||"Gespeicherter Text";
 const a=getSaved(); a.unshift({id:Date.now(),title,text,date:new Date().toISOString()}); setSaved(a);
 const n=$("#readerNotice");n.textContent="Der Text wurde gespeichert.";n.classList.remove("hidden");setTimeout(()=>n.classList.add("hidden"),2500);
};
function renderSaved(){
 const box=$("#savedList"), a=getSaved(); box.innerHTML="";
 if(!a.length){box.innerHTML='<div class="notice">Sie haben noch keine Texte gespeichert.</div>';return;}
 a.forEach(item=>{
  const d=document.createElement("div");d.className="savedItem";
  const h=document.createElement("h3");h.textContent=item.title;
  const p=document.createElement("p");p.textContent=new Date(item.date).toLocaleDateString("de-DE");
  const actions=document.createElement("div");actions.className="savedActions";
  const open=document.createElement("button");open.className="big accent";open.innerHTML="▶ <span>Öffnen</span>";open.onclick=()=>{currentText=item.text;localStorage.setItem("lmv-current",currentText);$("#homeReadBtn").disabled=false;show("reader")};
  const ren=document.createElement("button");ren.className="big neutral";ren.innerHTML="✏️ <span>Umbenennen</span>";ren.onclick=()=>{const name=prompt("Neuer Name:",item.title);if(name){item.title=name;setSaved(a);renderSaved()}};
  const del=document.createElement("button");del.className="big danger";del.innerHTML="🗑 <span>Löschen</span>";del.onclick=()=>{if(confirm("Diesen Text wirklich löschen?")){setSaved(a.filter(x=>x.id!==item.id));renderSaved()}};
  actions.append(open,ren,del);d.append(h,p,actions);box.append(d);
 });
}
$$('input[name="fontSize"]').forEach(r=>{r.checked=r.value===settings.font;r.onchange=()=>{settings.font=r.value;document.body.dataset.font=r.value;saveSettings()}});
$$('input[name="speed"]').forEach(r=>{r.checked=Number(r.value)===Number(settings.speed);r.onchange=()=>{settings.speed=Number(r.value);saveSettings()}});
function saveSettings(){localStorage.setItem("lmv-settings",JSON.stringify(settings))}
$("#homeReadBtn").disabled=!currentText.trim();
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
