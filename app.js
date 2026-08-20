const DB_NAME="jalsaarthi_sih", STORE="requests";
let db;

function openDB(){
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB_NAME,1);
    r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:"id"})};
    r.onsuccess=()=>{db=r.result;resolve(db)};
    r.onerror=()=>reject(r.error);
  });
}
function tx(mode="readonly"){return db.transaction(STORE,mode).objectStore(STORE)}
function getAll(){return new Promise((res,rej)=>{const r=tx().getAll();r.onsuccess=()=>res(r.result.sort((a,b)=>b.createdAt-a.createdAt));r.onerror=()=>rej(r.error)})}
function put(item){return new Promise((res,rej)=>{const r=tx("readwrite").put(item);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
function clearAll(){return new Promise((res,rej)=>{const r=tx("readwrite").clear();r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}

const chat=document.querySelector("#chat");
function addBubble(text,type="bot"){const d=document.createElement("div");d.className="bubble "+type;d.textContent=text;chat.appendChild(d);chat.scrollTop=chat.scrollHeight}
function botReply(m){
  const x=m.toLowerCase();
  if(x.includes("water")||x.includes("thanni")||x.includes("pipeline")) return "I can help create a service request. Please describe the location and, if available, attach a photo. I will keep the prototype record on this device only.";
  if(x.includes("track")) return "For the prototype, open the Officer View below. In production, this would query an authenticated government case-management API.";
  if(x.includes("service")) return "Tell me what government service you need. I can convert your natural-language request into a structured workflow.";
  return "I understand your request. For this SIH prototype, I can help classify the issue and create a minimal-data service request.";
}
function send(m){if(!m.trim())return;addBubble(m,"user");setTimeout(()=>addBubble(botReply(m)),250)}
document.querySelector("#chatForm").addEventListener("submit",e=>{e.preventDefault();const i=document.querySelector("#message");send(i.value);i.value=""});
document.querySelectorAll(".quick button").forEach(b=>b.onclick=()=>send(b.dataset.msg));

document.querySelector("#requestForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const file=document.querySelector("#evidence").files[0];
  // Store only metadata for evidence in this demo; do not persist sensitive files.
  const item={
    id:"JS-"+Date.now().toString(36).toUpperCase(),
    category:document.querySelector("#category").value,
    description:document.querySelector("#description").value.trim(),
    location:document.querySelector("#location").value.trim(),
    priority:document.querySelector("#priority").value,
    evidenceName:file?file.name:"",
    status:"New",
    createdAt:Date.now()
  };
  if(!item.description){toast("Add a description first");return}
  await put(item); e.target.reset(); await render(); toast("Private demo request created");
});

async function render(){
  const rows=await getAll();
  document.querySelector("#requestCount").textContent=rows.length;
  const box=document.querySelector("#requestList");
  box.innerHTML=rows.length?"":"<p class='muted'>No requests yet. Create one from the Request Builder.</p>";
  rows.forEach(r=>{
    const el=document.createElement("div");el.className="request";
    el.innerHTML=`<div><strong>${escapeHtml(r.id)} · ${escapeHtml(r.category)}</strong><p>${escapeHtml(r.description)} · ${escapeHtml(r.location||"No location")}</p><span class="muted">${new Date(r.createdAt).toLocaleString()}${r.evidenceName?" · Evidence attached: "+escapeHtml(r.evidenceName):""}</span></div><span class="badge">${escapeHtml(r.priority)} · ${escapeHtml(r.status)}</span>`;
    box.appendChild(el);
  });
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function toast(t){const x=document.querySelector("#toast");x.textContent=t;x.style.display="block";setTimeout(()=>x.style.display="none",2200)}

document.querySelector("#clearBtn").onclick=async()=>{if(confirm("Delete all locally stored prototype requests from this browser?")){await clearAll();render();toast("Local data deleted")}};
document.querySelector("#privacyBtn").onclick=()=>document.querySelector("#privacy").scrollIntoView({behavior:"smooth"});
document.querySelector("#exportBtn").onclick=async()=>{
  const blob=new Blob([JSON.stringify(await getAll(),null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="jalsaarthi-local-requests.json";a.click();URL.revokeObjectURL(a.href);
};

document.querySelector("#micBtn").onclick=()=>{
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition){toast("Voice input is not supported in this browser");return}
  const r=new SpeechRecognition();r.lang="ta-IN";r.interimResults=false;
  r.onresult=e=>document.querySelector("#message").value=e.results[0][0].transcript;
  r.onerror=()=>toast("Voice input failed");
  r.start();
};

(async()=>{await openDB();addBubble("Namaste! I am JalSaarthi AI. Tell me what government service or civic issue you need help with.");await render()})();
