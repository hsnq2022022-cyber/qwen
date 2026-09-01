/* ═══ channels.js — المهمة ٣: القنوات الموحدة ═══ */
(function(){
if(typeof NAV!=="undefined"&&!NAV.some(function(n){return n[0]==="channels"}))NAV.push(["channels","القنوات","send"]);
if(typeof PAGES!=="undefined")PAGES["channels"]="channels";

var CH_META={
whatsapp:{n:"واتساب",d:"Meta WhatsApp Cloud API",c:"#25D366",ic:"chat"},
messenger:{n:"فيسبوك ماسنجر",d:"Meta Messenger",c:"#0084FF",ic:"users"},
instagram:{n:"انستغرام",d:"Meta Instagram Direct",c:"#E1306C",ic:"spark"},
telegram:{n:"تليجرام",d:"Telegram Bot API",c:"#229ED9",ic:"send"}};

function chList(){var s=ws();return (s&&s.channels)||[]}
function chFind(t){return chList().find(function(c){return c.type===t})}
function webhookUrl(t){var wid=db.ws&&db.ws.__wid;var b=apiBase();return b?b+"/channel-webhook?ch="+t+"&ws="+wid:""}

window.pgChannels=function(){
var cards=Object.keys(CH_META).map(function(t){
var m=CH_META[t];var c=chFind(t);
var st=c?(c.enabled===false?'<span class="text-[10px] bg-ink-800 text-ink-400 border border-ink-700 rounded-full px-2 py-0.5">معطّلة</span>':'<span class="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full px-2 py-0.5">متصلة ✔</span>'):'<span class="text-[10px] bg-ink-800 text-ink-500 border border-ink-700 rounded-full px-2 py-0.5">غير مربوطة</span>';
return '<div class="glass rounded-2xl p-6">'
+'<div class="flex items-center gap-3 mb-3"><span class="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-none" style="background:'+m.c+'">'+icon(m.ic,"w-5 h-5")+'</span><div class="flex-1"><b class="font-display">'+m.n+'</b><div class="text-[11px] text-ink-500">'+m.d+'</div></div>'+st+'</div>'
+(c?'<div class="ltr bg-ink-950 border border-ink-800 rounded-xl p-2.5 font-mono text-[10px] text-ink-400 overflow-x-auto whitespace-nowrap mb-3">'+esc(webhookUrl(t))+'</div>'
+'<div class="flex flex-wrap gap-2"><button data-action="ch-edit" data-id="'+t+'" class="btn-ghost !py-1.5 text-xs">'+icon("edit","w-3.5 h-3.5")+' إعدادات</button><button data-action="ch-toggle" data-id="'+t+'" class="btn-ghost !py-1.5 text-xs">'+(c.enabled===false?"تفعيل":"تعطيل")+'</button><button data-action="ch-del" data-id="'+t+'" class="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg">'+icon("trash","w-3.5 h-3.5")+'</button></div>'
:'<button data-action="ch-edit" data-id="'+t+'" class="btn-primary w-full !py-2 text-sm">'+icon("plus","w-4 h-4")+' ربط القناة</button>')
+'</div>';}).join("");
return '<div class="mb-5"><h2 class="font-display font-bold text-xl">قنوات التواصل</h2><p class="text-xs text-ink-500 mt-1">اربط واتساب وفيسبوك وانستغرام وتليجرام — كل الرسائل تمر بنفس محرك المعرفة والردود والرصيد.</p></div>'
+'<div class="grid md:grid-cols-2 gap-4">'+cards+'</div>'
+'<div class="glass rounded-2xl p-5 mt-6 text-xs text-ink-400 leading-6"><b class="text-ink-200">طريقة الربط:</b><br>• تليجرام: أنشئ بوت من ‎@BotFather والصق التوكن — يُضبط الـ Webhook تلقائيًا.<br>• واتساب/ماسنجر/انستغرام: من Meta for Developers أنشئ تطبيقًا، والصق Access Token ورقم الصفحة/الهاتف هنا، ثم انسخ رابط الـ Webhook ورمز التحقق وضعهما في لوحة Meta.</div>';
};

var _renderDash=window.renderDash;
window.renderDash=function(h){
var seg=(h.split("?")[0].match(/#\/app\/?([\w-]*)/)||[,""])[1];
if(seg==="channels"){if(!me()){go("#/login");return}dashShell("channels",pgChannels(),"القنوات");return}
return _renderDash(h);};

var _loadRemote=window.loadRemote;
window.loadRemote=async function(){
var ok=await _loadRemote.apply(this,arguments);
if(ok&&db&&db.ws&&db.ws.__wid){try{var r=await sbClient().from("channels").select("data").eq("workspace_id",db.ws.__wid);db.ws.channels=(r.data||[]).map(function(x){return x.data})}catch(e){}}
return ok;};

function chModal(t){
var m=CH_META[t];var c=chFind(t)||{type:t,enabled:true,agentId:""};
var fields="";
if(t==="telegram"){
fields='<label class="lbl2">Bot Token (من ‎@BotFather) *<input name="botToken" class="inp-s ltr" value="'+esc(c.botToken||"")+'" placeholder="123456:ABC-DEF..."></label>';
}else{
fields='<label class="lbl2">Access Token (Meta) *<input name="accessToken" class="inp-s ltr" value="'+esc(c.accessToken||"")+'" placeholder="EAAB..."></label>'
+(t==="whatsapp"?'<label class="lbl2">Phone ID *<input name="phoneId" class="inp-s ltr" value="'+esc(c.phoneId||"")+'"></label>':'<label class="lbl2">Page ID *<input name="pageId" class="inp-s ltr" value="'+esc(c.pageId||"")+'"></label>')
+'<label class="lbl2">رمز التحقق (Verify Token)<input name="verifyToken" class="inp-s ltr" value="'+esc(c.verifyToken||uid("vt_"))+'"></label>';
}
modal('<h3 class="font-display font-bold text-lg mb-4">ربط قناة '+m.n+'</h3><form id="f-channel" class="space-y-3"><input type="hidden" name="type" value="'+t+'">'
+fields
+'<label class="lbl2">الوكيل المسؤول عن الرد<select name="agentId" class="inp-s">'+agentOptions(c.agentId||"")+'</select></label>'
+'<div class="flex gap-2"><button class="btn-primary flex-1">حفظ وربط القناة</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');
}

function chSync(c){
var s=ws();
if(!(isRemote()&&s&&s.__wid))return Promise.resolve();
return sbClient().from("channels").upsert({id:"ch_"+s.__wid+"_"+c.type,workspace_id:s.__wid,data:c},{onConflict:"id"}).then(function(){});
}

document.addEventListener("click",function(e){
var t=e.target&&e.target.closest?e.target.closest("[data-action]"):null;if(!t)return;
var a=t.dataset.action,id=t.dataset.id;
if(a==="ch-edit")chModal(id);
else if(a==="ch-toggle"){var c=chFind(id);if(c){c.enabled=(c.enabled===false);save();chSync(c).then(function(){toast(c.enabled?"تم تفعيل القناة ✔":"تم تعطيل القناة","ok");route()})}}
else if(a==="ch-del"){if(!confirm("فصل هذه القناة؟"))return;var s2=ws();s2.channels=(s2.channels||[]).filter(function(c){return c.type!==id});save();
if(isRemote()&&s2.__wid){try{sbClient().from("channels").delete().eq("id","ch_"+s2.__wid+"_"+id).then(function(){})}catch(e){}}
toast("تم فصل القناة","ok");route();}
});

document.addEventListener("submit",async function(e){
var f=e.target;if(!f||f.id!=="f-channel")return;
e.preventDefault();
var fd=new FormData(f);var type=fd.get("type");
var s=ws();s.channels=s.channels||[];
var c=chFind(type)||{type:type,enabled:true};
c.agentId=fd.get("agentId")||"";
if(type==="telegram"){c.botToken=String(fd.get("botToken")||"").trim();if(!c.botToken){toast("أدخل توكن البوت","err");return}}
else{c.accessToken=String(fd.get("accessToken")||"").trim();c.phoneId=String(fd.get("phoneId")||"").trim();c.pageId=String(fd.get("pageId")||"").trim();c.verifyToken=String(fd.get("verifyToken")||"").trim();if(!c.accessToken){toast("أدخل Access Token","err");return}}
if(!chFind(type))s.channels.push(c);
closeModal();save();
if(type==="telegram"&&c.botToken&&isRemote()&&s.__wid){
toast("جارٍ ضبط Webhook لتليجرام...");
try{var r=await fetch(webhookUrl("telegram")+"&setup="+encodeURIComponent(c.botToken));var j=await r.json().catch(function(){return{}});
toast(j.ok?"تم ربط تليجرام وضبط الـ Webhook ✔":"فشل ضبط الـ Webhook: "+(j.description||""),j.ok?"ok":"err");}catch(err){toast("تعذر ضبط الـ Webhook","err")}
}else{toast("تم حفظ إعدادات القناة ✔ — أكمل إعداد الـ Webhook من لوحة Meta","ok");}
await chSync(c);route();
});

if(typeof route==="function")route();
})();
