/* ═══════════ extra.js — كل الإضافات في ملف واحد ═══════════ */

/* ── [1] المحرك المتقدم: برومبت + قواعد + كلمات مفتاحية + سجل الأسئلة ── */
function parseKeywords(str){var out=[];String(str||'').split(/\n+/).forEach(function(line){var i=line.indexOf('|');if(i>-1){var k=norm(line.slice(0,i)).trim();var v=line.slice(i+1).trim();if(k&&v)out.push({k:k,v:v});}});return out;}
function parseRules(str){return String(str||'').split(/\n+/).map(function(s){return s.trim()}).filter(Boolean);}
var _agentModal=window.agentModal;
window.agentModal=function(id){
var a=id?ws().agents.find(function(x){return x.id===id}):null;
var v=a||{name:'',desc:'',avatar:AVT[0],instructions:'',language:'العربية',tone:'ودي واحترافي',model:'gemini-2.5-flash-lite',welcome:'أهلًا بك 👋 كيف أقدر أساعدك؟',fallback:NO_INFO_MSG,sysprompt:'',rules:'',keywords:''};
var avs=AV_LOCAL.map(function(u){return '<label class="cursor-pointer"><input type="radio" name="avatar" value="'+u+'" class="hidden peer" '+(v.avatar===u?'checked':'')+'><img src="'+u+'" class="w-12 h-12 rounded-xl object-cover border-2 peer-checked:border-tiffany-500 border-transparent"></label>'}).join('');
modal('<h3 class="font-display font-bold text-lg mb-5">'+(a?'تعديل':'إنشاء')+' Agent — المحرك المتقدم</h3><form id="f-agent" class="space-y-3">'
+'<input type="hidden" name="id" value="'+((a&&a.id)||'')+'">'
+'<label class="lbl2">اسم الـ Agent *<input name="name" required class="inp-s" value="'+esc(v.name)+'"></label>'
+'<label class="lbl2">الوصف<input name="desc" class="inp-s" value="'+esc(v.desc)+'"></label>'
+'<div class="text-xs text-ink-400 mb-1">Avatar</div><div class="flex gap-2 mb-1">'+avs+'</div>'
+'<label class="lbl2">التعليمات الأساسية *<textarea name="instructions" required rows="3" class="inp-s">'+esc(v.instructions)+'</textarea></label>'
+'<label class="lbl2">البرومبت المتقدم<textarea name="sysprompt" rows="3" class="inp-s"></textarea>'.replace('></textarea>','>'+esc(v.sysprompt||'')+'</textarea>')
+'<label class="lbl2">القواعد (سطر لكل قاعدة)<textarea name="rules" rows="4" class="inp-s">'+esc(v.rules||'')+'</textarea></label>'
+'<label class="lbl2">الكلمات المفتاحية (كلمة | رد) أو (كلمة | kb)<textarea name="keywords" rows="4" class="inp-s">'+esc(v.keywords||'')+'</textarea></label>'
+'<div class="grid grid-cols-2 gap-3"><label class="lbl2">اللغة<select name="language" class="inp-s">'+['العربية','English','ثنائي اللغة'].map(function(l){return '<option '+(l===v.language?'selected':'')+'>'+l+'</option>'}).join('')+'</select></label><label class="lbl2">النبرة<select name="tone" class="inp-s">'+['ودي واحترافي','رسمي','مرح','هادئ ومتعاطف','خليجي ودود'].map(function(l){return '<option '+(l===v.tone?'selected':'')+'>'+l+'</option>'}).join('')+'</select></label></div>'
+'<label class="lbl2">النموذج<select name="model" class="inp-s">'+AI_MODELS.map(function(l){return '<option '+(l===v.model?'selected':'')+'>'+l+'</option>'}).join('')+'</select></label>'
+'<label class="lbl2">الترحيب<input name="welcome" class="inp-s" value="'+esc(v.welcome)+'"></label>'
+'<label class="lbl2">رسالة عدم المعرفة<input name="fallback" class="inp-s" value="'+esc(v.fallback)+'"></label>'
+'<div class="flex gap-2 pt-2"><button class="btn-primary flex-1">حفظ الـ Agent</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');};
var _aiRespondLocal=window.aiRespondLocal;
window.aiRespondLocal=function(text,agent,agentId){
var t=norm(text);
if(agent&&agent.keywords){var kws=parseKeywords(agent.keywords);
for(var i=0;i<kws.length;i++){if(t.indexOf(kws[i].k)>-1){
if(kws[i].v.toLowerCase()==='kb'){var hits=searchKB(text,agentId);if(hits.length&&hits[0].sc>=1)return {text:hits.map(function(h){return h.text}).join('\n')};break;}
return {text:kws[i].v};}}}
return _aiRespondLocal(text,agent,agentId);};
function logGap(q,agentId){var s=ws();if(!s||!q)return;s.kb_gaps=s.kb_gaps||[];
var g=s.kb_gaps.find(function(x){return x.q===q&&x.status!=='done'});
if(g){g.count=(g.count||1)+1;g.at=now();}else{g={id:uid('gap_'),q:q,agentId:agentId||'',count:1,at:now(),status:'open'};s.kb_gaps.unshift(g);}
s.kb_gaps=s.kb_gaps.slice(0,50);save();
if(isRemote()&&s.__wid){try{sbClient().from('kb_gaps').upsert({id:g.id,workspace_id:s.__wid,data:g},{onConflict:'id'}).then(function(){}).catch(function(){});}catch(e){}}}
var _getAIReply=window.getAIReply;
window.getAIReply=async function(text,agent,widget,convo){
var res=await _getAIReply(text,agent,widget,convo);
if(res&&!res.system&&res.text===NO_INFO_MSG&&!isRemote()){logGap(text,widget?widget.agentId:(agent&&agent.id)||'');}
return res;};
var _pgKB=window.pgKB;
window.pgKB=function(){var base=_pgKB();var s=ws();var gaps=(s&&s.kb_gaps)||[];
var open=gaps.filter(function(g){return g.status!=='done'});
var head='<div class="mt-8"><div class="flex items-center justify-between flex-wrap gap-2 mb-4"><h2 class="font-display font-bold text-xl">أسئلة لم يُجب عنها الوكيل ('+open.length+')</h2></div>';
if(!gaps.length)return base+head+'<div class="glass rounded-2xl p-10 text-center text-ink-500">لا أسئلة معلّقة 🎉</div></div>';
var rows=gaps.map(function(g){return '<div class="glass rounded-xl p-4 flex items-center gap-3 flex-wrap"><div class="flex-1 min-w-[220px]"><div class="text-sm font-semibold">"'+esc(g.q)+'"</div><div class="text-[10px] text-ink-500 mt-1">تكرّر '+g.count+' مرة • '+timeAgo(g.at)+'</div></div>'+(g.status==='done'?'<span class="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">مُدرّب ✔</span>':'<button data-action="gap-train" data-id="'+g.id+'" class="btn-primary !py-1.5 !px-3 text-xs">أضف إجابة ودرّب</button>')+'<button data-action="gap-del" data-id="'+g.id+'" class="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg">'+icon('trash','w-3.5 h-3.5')+'</button></div>';}).join('');
return base+head+'<div class="space-y-2">'+rows+'</div></div>';};
document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('[data-action]'):null;if(!t)return;var a=t.dataset.action,id=t.dataset.id;
if(a==='gap-train'){var g=(ws().kb_gaps||[]).find(function(x){return x.id===id});if(!g)return;
modal('<h3 class="font-display font-bold mb-3">تدريب الوكيل</h3><p class="text-xs text-ink-500 mb-3">السؤال: <b>"'+esc(g.q)+'"</b></p><form id="f-gap" class="space-y-3"><input type="hidden" name="gapId" value="'+g.id+'"><label class="lbl2">الإجابة الصحيحة *<textarea name="answer" rows="5" required class="inp-s"></textarea></label><label class="lbl2">ربط بـ Agent<select name="agentId" class="inp-s">'+agentOptions(g.agentId||'')+'</select></label><div class="flex gap-2"><button class="btn-primary flex-1">حفظ وتدريب</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');}
else if(a==='gap-del'){var s=ws();s.kb_gaps=(s.kb_gaps||[]).filter(function(x){return x.id!==id});save();route();}});
document.addEventListener('submit',async function(e){var f=e.target;if(!f||f.id!=='f-gap')return;e.preventDefault();
var fd=new FormData(f);var gapId=fd.get('gapId');var answer=String(fd.get('answer')||'').trim();var agentId=fd.get('agentId')||'';
if(!answer){toast('اكتب الإجابة أولًا','err');return}
var g=(ws().kb_gaps||[]).find(function(x){return x.id===gapId});
var title='تدريب: '+(g?g.q:'سؤال').slice(0,50);var content='س: '+(g?g.q:'')+'\nج: '+answer;
closeModal();var ok=await processTextDoc(title,content,agentId);
if(ok&&g){g.status='done';save();toast('تم التدريب ✔','ok');route();}});

/* ── [2] القنوات الأربع ── */
(function(){
if(typeof NAV!=="undefined"&&!NAV.some(function(n){return n[0]==="channels"}))NAV.push(["channels","القنوات","send"]);
if(typeof PAGES!=="undefined")PAGES["channels"]="channels";
var CH_META={whatsapp:{n:"واتساب",d:"Meta WhatsApp Cloud API",c:"#25D366",ic:"chat"},messenger:{n:"فيسبوك ماسنجر",d:"Meta Messenger",c:"#0084FF",ic:"users"},instagram:{n:"انستغرام",d:"Meta Instagram Direct",c:"#E1306C",ic:"spark"},telegram:{n:"تليجرام",d:"Telegram Bot API",c:"#229ED9",ic:"send"}};
function chList(){var s=ws();return (s&&s.channels)||[]}
function chFind(t){return chList().find(function(c){return c.type===t})}
function webhookUrl(t){var wid=db.ws&&db.ws.__wid;var b=apiBase();return b?b+"/channel-webhook?ch="+t+"&ws="+wid:""}
window.pgChannels=function(){
var cards=Object.keys(CH_META).map(function(t){var m=CH_META[t];var c=chFind(t);
var st=c?(c.enabled===false?'<span class="text-[10px] bg-ink-800 text-ink-400 border border-ink-700 rounded-full px-2 py-0.5">معطّلة</span>':'<span class="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full px-2 py-0.5">متصلة ✔</span>'):'<span class="text-[10px] bg-ink-800 text-ink-500 border border-ink-700 rounded-full px-2 py-0.5">غير مربوطة</span>';
return '<div class="glass rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><span class="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-none" style="background:'+m.c+'">'+icon(m.ic,"w-5 h-5")+'</span><div class="flex-1"><b class="font-display">'+m.n+'</b><div class="text-[11px] text-ink-500">'+m.d+'</div></div>'+st+'</div>'
+(c?'<div class="ltr bg-ink-950 border border-ink-800 rounded-xl p-2.5 font-mono text-[10px] text-ink-400 overflow-x-auto whitespace-nowrap mb-3">'+esc(webhookUrl(t))+'</div><div class="flex flex-wrap gap-2"><button data-action="ch-edit" data-id="'+t+'" class="btn-ghost !py-1.5 text-xs">إعدادات</button><button data-action="ch-toggle" data-id="'+t+'" class="btn-ghost !py-1.5 text-xs">'+(c.enabled===false?"تفعيل":"تعطيل")+'</button><button data-action="ch-del" data-id="'+t+'" class="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg">'+icon("trash","w-3.5 h-3.5")+'</button></div>'
:'<button data-action="ch-edit" data-id="'+t+'" class="btn-primary w-full !py-2 text-sm">ربط القناة</button>')+'</div>';}).join("");
return '<div class="mb-5"><h2 class="font-display font-bold text-xl">قنوات التواصل</h2><p class="text-xs text-ink-500 mt-1">كل الرسائل تمر بنفس محرك المعرفة والرصيد.</p></div><div class="grid md:grid-cols-2 gap-4">'+cards+'</div>';};
var _renderDashC=window.renderDash;
window.renderDash=function(h){var seg=(h.split("?")[0].match(/#\/app\/?([\w-]*)/)||[,""])[1];
if(seg==="channels"){if(!me()){go("#/login");return}dashShell("channels",pgChannels(),"القنوات");return}
return _renderDashC(h);};
var _loadRemoteC=window.loadRemote;
window.loadRemote=async function(){var ok=await _loadRemoteC.apply(this,arguments);
if(ok&&db&&db.ws&&db.ws.__wid){try{var r=await sbClient().from("channels").select("data").eq("workspace_id",db.ws.__wid);db.ws.channels=(r.data||[]).map(function(x){return x.data})}catch(e){}}
return ok;};
function chModal(t){var m=CH_META[t];var c=chFind(t)||{type:t,enabled:true,agentId:""};var fields="";
if(t==="telegram"){fields='<label class="lbl2">Bot Token (من @BotFather) *<input name="botToken" class="inp-s ltr" value="'+esc(c.botToken||"")+'"></label>';}
else{fields='<label class="lbl2">Access Token (Meta) *<input name="accessToken" class="inp-s ltr" value="'+esc(c.accessToken||"")+'"></label>'+(t==="whatsapp"?'<label class="lbl2">Phone ID *<input name="phoneId" class="inp-s ltr" value="'+esc(c.phoneId||"")+'"></label>':'<label class="lbl2">Page ID *<input name="pageId" class="inp-s ltr" value="'+esc(c.pageId||"")+'"></label>')+'<label class="lbl2">رمز التحقق<input name="verifyToken" class="inp-s ltr" value="'+esc(c.verifyToken||uid("vt_"))+'"></label>';}
modal('<h3 class="font-display font-bold text-lg mb-4">ربط قناة '+m.n+'</h3><form id="f-channel" class="space-y-3"><input type="hidden" name="type" value="'+t+'">'+fields+'<label class="lbl2">الوكيل المسؤول<select name="agentId" class="inp-s">'+agentOptions(c.agentId||"")+'</select></label><div class="flex gap-2"><button class="btn-primary flex-1">حفظ وربط</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');}
function chSync(c){var s=ws();if(!(isRemote()&&s&&s.__wid))return Promise.resolve();return sbClient().from("channels").upsert({id:"ch_"+s.__wid+"_"+c.type,workspace_id:s.__wid,data:c},{onConflict:"id"}).then(function(){});}
document.addEventListener("click",function(e){var t=e.target&&e.target.closest?e.target.closest("[data-action]"):null;if(!t)return;var a=t.dataset.action,id=t.dataset.id;
if(a==="ch-edit")chModal(id);
else if(a==="ch-toggle"){var c=chFind(id);if(c){c.enabled=(c.enabled===false);save();chSync(c).then(function(){toast(c.enabled?"تم التفعيل ✔":"تم التعطيل","ok");route()})}}
else if(a==="ch-del"){if(!confirm("فصل القناة؟"))return;var s2=ws();s2.channels=(s2.channels||[]).filter(function(c){return c.type!==id});save();route();}});
document.addEventListener("submit",async function(e){var f=e.target;if(!f||f.id!=="f-channel")return;e.preventDefault();
var fd=new FormData(f);var type=fd.get("type");var s=ws();s.channels=s.channels||[];
var c=chFind(type)||{type:type,enabled:true};c.agentId=fd.get("agentId")||"";
if(type==="telegram"){c.botToken=String(fd.get("botToken")||"").trim();if(!c.botToken){toast("أدخل توكن البوت","err");return}}
else{c.accessToken=String(fd.get("accessToken")||"").trim();c.phoneId=String(fd.get("phoneId")||"").trim();c.pageId=String(fd.get("pageId")||"").trim();c.verifyToken=String(fd.get("verifyToken")||"").trim();if(!c.accessToken){toast("أدخل Access Token","err");return}}
if(!chFind(type))s.channels.push(c);closeModal();save();
if(type==="telegram"&&c.botToken&&isRemote()&&s.__wid){toast("جارٍ ضبط Webhook تليجرام...");
try{var r=await fetch(webhookUrl("telegram")+"&setup="+encodeURIComponent(c.botToken));var j=await r.json().catch(function(){return{}});toast(j.ok?"تم ربط تليجرام ✔":"فشل: "+(j.description||""),j.ok?"ok":"err");}catch(err){toast("تعذر ضبط الـ Webhook","err")}}
else{toast("تم حفظ القناة ✔","ok")}
await chSync(c);route();});
})();

/* ── [3] الجودة: مراجعة + تصعيد + تحليلات قنوات ── */
(function(){
var SENSITIVE=['غاضب','زعلان','احتيال','نصاب','سرق','سرقة','محامي','قضية','شكوى رسمية','وزارة','تعويض','ارجع فلوسي','فضح','اعلام','صحفي','مقاطعة','بلاغ','شرطة','تهديد','حقير','غبي'];
function isSensitive(text){var t=norm(text);return SENSITIVE.some(function(w){return t.indexOf(norm(w))>-1})}
var CHN={widget:'ويدجت الموقع',telegram:'تليجرام',whatsapp:'واتساب',messenger:'ماسنجر',instagram:'انستغرام'};
var _getAIReplyQ=window.getAIReply;
window.getAIReply=async function(text,agent,widget,convo){var res=await _getAIReplyQ(text,agent,widget,convo);
if(!res||res.system)return res;var s=ws();
if(isSensitive(text)){s.escalations=s.escalations||[];s.escalations.unshift({id:uid('esc_'),q:text,convoId:convo?convo.id:null,channel:(convo&&convo.channel)||'widget',at:now(),status:'open'});s.escalations=s.escalations.slice(0,50);
if(convo)convo.messages.push({from:'system',text:'⚠️ حالة حساسة — تم إشعار الإدارة.',at:now()});save();}
if(s&&s.settings&&s.settings.reviewWidget&&convo){convo.pendingReply=res.text;convo.reviewState='pending';save();return {system:true,text:'📨 تم استلام رسالتك — سيصلك الرد بعد مراجعته.'};}
return res;};
var _pgHomeQ=window.pgHome;
window.pgHome=function(){var base=_pgHomeQ();var s=ws();
var pend=(s.convos||[]).filter(function(c){return c.reviewState==='pending'});
var escs=(s.escalations||[]).filter(function(x){return x.status==='open'});
if(!pend.length&&!escs.length)return base;
var pendHtml=pend.map(function(c){var ct=s.contacts.find(function(x){return x.id===c.contactId});var last=(c.messages||[]).filter(function(m){return m.from==='visitor'}).pop();
return '<div class="glass rounded-xl p-4 space-y-2"><div class="text-xs text-ink-500">'+esc((ct&&ct.name)||'زائر')+' • '+(CHN[c.channel||'widget']||'ويدجت')+'</div><div class="text-sm">❓ '+esc((last&&last.text)||'')+'</div><div class="text-sm text-tiffany-300 bg-tiffany-500/5 border border-tiffany-500/20 rounded-lg p-2">🤖 '+esc(c.pendingReply||'')+'</div><div class="flex gap-2"><button data-action="rv-approve" data-id="'+c.id+'" class="btn-primary !py-1.5 !px-3 text-xs">اعتماد</button><button data-action="rv-edit" data-id="'+c.id+'" class="btn-ghost !py-1.5 !px-3 text-xs">تعديل</button><button data-action="rv-reject" data-id="'+c.id+'" class="btn-ghost !py-1.5 !px-3 text-xs !text-red-300">رفض</button></div></div>';}).join('');
var escHtml=escs.map(function(x){return '<div class="glass rounded-xl p-3 flex items-center gap-3"><div class="flex-1"><div class="text-sm">⚠️ '+esc(x.q)+'</div><div class="text-[10px] text-ink-500 mt-1">'+(CHN[x.channel]||'ويدجت')+'</div></div><button data-action="esc-done" data-id="'+x.id+'" class="btn-ghost !py-1.5 !px-3 text-xs">تم التعامل</button></div>';}).join('');
return '<div class="grid lg:grid-cols-2 gap-4 mb-6">'+(pend.length?'<div><h3 class="font-display font-bold mb-3">📨 ردود بانتظار مراجعتك ('+pend.length+')</h3><div class="space-y-3">'+pendHtml+'</div></div>':'')+(escs.length?'<div><h3 class="font-display font-bold mb-3">⚠️ حالات حساسة ('+escs.length+')</h3><div class="space-y-2">'+escHtml+'</div></div>':'')+'</div>'+base;};
var _pgAnalyticsQ=window.pgAnalytics;
window.pgAnalytics=function(){var base=_pgAnalyticsQ();var s=ws();var chans={};
(s.convos||[]).forEach(function(c){var k=c.channel||'widget';chans[k]=(chans[k]||0)+1});
var total=Math.max(1,(s.convos||[]).length);
var rows=Object.keys(chans).map(function(k){var n=chans[k];var pct=Math.round(n/total*100);return '<div class="flex items-center gap-3"><span class="text-xs text-ink-400 w-24 flex-none">'+(CHN[k]||k)+'</span><div class="flex-1 h-6 bg-ink-850 rounded-lg overflow-hidden"><div class="h-full bg-tiffany-500/25 border-l border-tiffany-500/50 flex items-center px-3 text-xs" style="width:'+Math.max(pct,8)+'%">'+n+'</div></div></div>';}).join('');
return base+'<div class="glass rounded-2xl p-6 mt-4"><h3 class="font-display font-bold mb-4">المحادثات حسب القناة</h3><div class="space-y-2">'+rows+'</div></div>';};
var _pgSettingsQ=window.pgSettings;
window.pgSettings=function(){var base=_pgSettingsQ();var s=ws();var on=!!(s.settings.reviewWidget);
return base+'<div class="glass rounded-2xl p-6 mt-5"><h3 class="font-display font-bold mb-2">🛡️ مركز الجودة</h3><p class="text-xs text-ink-500 mb-4">كل رد يُحفظ بانتظار المراجعة ولا يصل للعميل حتى تعتمده.</p><button data-action="qw-toggle" class="switch'+(on?' on':'')+'"></button> <span class="text-sm mr-2">مراجعة الردود قبل الإرسال</span></div>';};
function sendApproved(c){var s=ws();if(c.channel&&isRemote()&&s&&s.__wid){return fetch(apiBase()+'/channel-webhook?act=approve&ws='+s.__wid+'&cv='+c.id).then(function(){}).catch(function(){})}return Promise.resolve();}
document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('[data-action]'):null;if(!t)return;var a=t.dataset.action,id=t.dataset.id;var s=ws();
if(a==='rv-approve'){var c=s.convos.find(function(x){return x.id===id});if(!c||!c.pendingReply)return;
c.messages.push({from:'ai',text:c.pendingReply,at:now()});c.reviewState='approved';delete c.pendingReply;save();sendApproved(c).then(function(){toast('تم الاعتماد ✔','ok');route()});}
else if(a==='rv-edit'){var c2=s.convos.find(function(x){return x.id===id});if(!c2)return;
modal('<h3 class="font-display font-bold mb-3">تعديل الرد</h3><form id="f-rvedit" class="space-y-3"><input type="hidden" name="cid" value="'+c2.id+'"><textarea name="reply" rows="6" class="inp-s">'+esc(c2.pendingReply||'')+'</textarea><div class="flex gap-2"><button class="btn-primary flex-1">حفظ واعتماد</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');}
else if(a==='rv-reject'){var c3=s.convos.find(function(x){return x.id===id});if(!c3)return;c3.reviewState='rejected';delete c3.pendingReply;save();route();}
else if(a==='esc-done'){var x=(s.escalations||[]).find(function(y){return y.id===id});if(x)x.status='done';save();route();}
else if(a==='qw-toggle'){var on=!(s.settings.reviewWidget);s.settings.reviewWidget=on;
(s.channels||[]).forEach(function(ch){ch.reviewMode=on;if(isRemote()&&s.__wid){try{sbClient().from('channels').upsert({id:'ch_'+s.__wid+'_'+ch.type,workspace_id:s.__wid,data:ch},{onConflict:'id'}).then(function(){}).catch(function(){})}catch(e){}}});
save();toast(on?'تم تفعيل المراجعة ✔':'تم إيقاف المراجعة','ok');route();}});
document.addEventListener('submit',function(e){var f=e.target;if(!f||f.id!=='f-rvedit')return;e.preventDefault();
var fd=new FormData(f);var s=ws();var c=s.convos.find(function(x){return x.id===fd.get('cid')});if(!c)return;
var txt=String(fd.get('reply')||'').trim();if(!txt){toast('اكتب الرد','err');return}
c.messages.push({from:'ai',text:txt,at:now()});c.reviewState='approved';delete c.pendingReply;save();closeModal();
sendApproved(c).then(function(){toast('تم الاعتماد ✔','ok');route()});});
})();

/* ── [4] إصلاحات: onboarded + النوافذ ── */
(function(){
var _pushTablesF=window.pushTables;
window.pushTables=async function(c,wid,s){var r=await _pushTablesF.apply(this,arguments);
try{await c.from('workspaces').update({onboarded:(s.settings.onboarded===true)}).eq('id',wid);}catch(e){}return r;};
var _loadRemoteF=window.loadRemote;
window.loadRemote=async function(){var ok=await _loadRemoteF.apply(this,arguments);
if(ok&&db&&db.ws&&db.ws.__wid){try{var r=await sbClient().from('workspaces').select('onboarded').eq('id',db.ws.__wid).maybeSingle();
if(r.data&&r.data.onboarded===true&&db.ws.settings.onboarded!==true){db.ws.settings.onboarded=true;persist();}}catch(e){}}
return ok;};
window.modal=function(html){document.getElementById('modal-root').innerHTML='<div class="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4" data-action="modal-close"><div class="modal-inner glass rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto p-6 fadeUp shadow-soft">'+html+'</div></div>';};
document.addEventListener('click',function(e){var root=document.getElementById('modal-root');
if(!root||!root.contains(e.target))return;var inner=e.target.closest('.modal-inner');if(!inner)return;
var act=e.target.closest('[data-action]');if(act&&inner.contains(act))return;e.stopPropagation();},true);
})();

/* ── [5] دمج الوكلاء والودجات ── */
(function(){
if(window.NAV){for(var i=NAV.length-1;i>=0;i--){if(NAV[i][0]==='agents'||NAV[i][0]==='widgets')NAV.splice(i,1);}
var idx=-1;for(var j=0;j<NAV.length;j++){if(NAV[j][0]==='conversations'){idx=j;break;}}
NAV.splice(idx+1,0,['studio','الوكلاء والودجات','bot']);}
if(window.PAGES)PAGES['studio']='studio';
function mergedPage(){var w=ws();var shared=w.kb.filter(function(k){return !k.agentId}).length;
var cards=w.agents.map(function(a){var kbs=w.kb.filter(function(k){return k.agentId===a.id}).length;
var wgs=w.widgets.filter(function(x){return x.agentId===a.id});
var wHtml=wgs.map(function(x){return '<div class="bg-ink-900/60 border border-ink-800 rounded-xl p-4"><div class="flex items-center gap-3"><span class="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-none" style="background:'+(x.primary||'#0ABAB5')+'">'+icon('widget','w-4 h-4')+'</span><div class="flex-1 min-w-0"><b class="text-sm">'+esc(x.name)+'</b><div class="text-[10px] text-ink-500 mt-0.5">'+(x.enabled?'● نشط':'● معطل')+'</div></div><button data-action="w-toggle" data-id="'+x.id+'" class="switch'+(x.enabled?' on':'')+'"></button></div><div class="flex flex-wrap gap-2 mt-3"><button data-action="open-builder" data-id="'+x.id+'" class="btn-ghost !py-1.5 text-xs">تخصيص</button><button data-action="embed" data-id="'+x.id+'" class="btn-ghost !py-1.5 text-xs">كود التضمين</button><button data-action="go" data-to="#/test?wid='+x.id+'" class="btn-ghost !py-1.5 text-xs">اختبار</button><button data-action="del-widget" data-id="'+x.id+'" class="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg">'+icon('trash','w-3.5 h-3.5')+'</button></div></div>';}).join('');
return '<div class="glass rounded-2xl p-6"><div class="flex items-start gap-3 mb-4"><img src="'+(a.avatar||AVT[0])+'" class="w-12 h-12 rounded-xl object-cover border border-ink-700" alt=""><div class="flex-1 min-w-0"><h3 class="font-display font-bold">'+esc(a.name)+'</h3><p class="text-[11px] text-ink-500 mt-0.5">'+esc(a.model)+' • '+kbs+' مصدر خاص + '+shared+' مشترك</p></div><button data-action="edit-agent" data-id="'+a.id+'" class="p-2 text-ink-400 hover:text-white hover:bg-ink-800 rounded-lg">'+icon('edit','w-4 h-4')+'</button><button data-action="del-agent" data-id="'+a.id+'" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">'+icon('trash','w-4 h-4')+'</button></div><div class="space-y-3">'+(wHtml||'<div class="text-xs text-ink-500">لا ودجات لهذا الوكيل.</div>')+'</div><button data-action="new-widget-for" data-id="'+a.id+'" class="btn-ghost w-full !py-2 text-xs mt-3">+ إضافة ويدجت لهذا الوكيل</button></div>';}).join('');
return '<div class="flex items-center justify-between mb-5"><div><h2 class="font-display font-bold text-xl">الوكلاء والودجات</h2></div><button data-action="new-agent" class="btn-primary">'+icon('plus','w-4 h-4')+' وكيل جديد</button></div><div class="grid lg:grid-cols-2 gap-4">'+(cards||'<div class="lg:col-span-2 glass rounded-2xl p-14 text-center text-ink-500">لا وكلاء بعد.</div>')+'</div>';}
var _renderDashM=window.renderDash;
window.renderDash=function(h){var seg=(h.split('?')[0].match(/#\/app\/?([\w-]*)/)||[,''])[1];
if(seg==='studio'||seg==='agents'||seg==='widgets'){if(!me()){go('#/login');return}dashShell('studio',mergedPage(),'الوكلاء والودجات');return}
return _renderDashM(h);};
document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('[data-action]'):null;if(!t)return;
if(t.dataset.action!=='new-widget-for')return;var aid=t.dataset.id;
var ag=ws().agents.find(function(a){return a.id===aid});var name=prompt('اسم الويدجت:','ويدجت '+((ag&&ag.name)||''));if(!name)return;
var nw=defWidget(aid,name);ws().widgets.push(nw);persist();
if(isRemote()){syncWidgetToServer(nw).then(function(){toast('تم الإنشاء ✔','ok');save();route()}).catch(function(err){toast('محليًا: '+err.message,'err');save();route()});}
else{save();toast('تم الإنشاء ✔','ok');route();}});
})();
if(typeof route==='function')route();
