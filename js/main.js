/* ================= Helpers ================= */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const uid=p=>(p||'')+Math.random().toString(36).slice(2,9);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const now=()=>Date.now();
const DAY=864e5;
const fmtDate=t=>new Intl.DateTimeFormat('ar',{day:'numeric',month:'short'}).format(t);
const fmtTime=t=>new Intl.DateTimeFormat('ar',{hour:'numeric',minute:'2-digit'}).format(t);
const timeAgo=t=>{const d=now()-t;if(d<6e4)return 'الآن';if(d<36e5)return 'قبل '+Math.floor(d/6e4)+' د';if(d<DAY)return 'قبل '+Math.floor(d/36e5)+' س';return 'قبل '+Math.floor(d/DAY)+' يوم'};
const hashPw=s=>{let h=9;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),387420489);return 'h'+(h^h>>>9)};
const norm=s=>String(s||'').replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').toLowerCase();
const tokens=s=>norm(s).split(/[^\u0600-\u06FFa-z0-9]+/).filter(w=>w.length>2);
const isNetErr=m=>/failed to fetch|networkerror|load failed|network request|timeout|aborted/i.test(String(m||''));
function fmtSize(b){if(b==null)return '';if(b<1024)return b+' B';if(b<1048576)return (b/1024).toFixed(1)+' KB';return (b/1048576).toFixed(1)+' MB'}
function arErr(m){m=String(m||'');if(isNetErr(m))return 'تعذر الوصول إلى الخادم — تحقق من اتصال الإنترنت';if(/401|invalid api key|invalid key/i.test(m))return 'خطأ في مفتاح الاتصال بالخادم';return m}
function md(s){let t=esc(s);t=t.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
t=t.replace(/\[(.+?)\]\((.+?)\)/g,function(m,txt,rawUrl){const u=String(rawUrl||'').trim();
if(/^https?:\/\//i.test(u))return '<a class="underline text-tiffany-400" target="_blank" rel="noopener noreferrer" href="'+u+'">'+txt+'</a>';return txt;});
return t.replace(/\n/g,'<br>');}
function toast(msg,type){const c=document.getElementById('toasts');if(!c)return;const el=document.createElement('div');
el.className='fadeUp glass rounded-xl px-4 py-3 text-sm flex items-center gap-2 shadow-soft '+(type==='err'?'!border-red-500/40 text-red-300':type==='ok'?'!border-tiffany-500/40 text-tiffany-300':'text-ink-100');
el.innerHTML=(type==='err'?'⚠️':type==='ok'?'✅':'ℹ️')+'<span>'+esc(msg)+'</span>';c.appendChild(el);
setTimeout(function(){el.style.opacity='0';el.style.transition='.4s';setTimeout(function(){el.remove()},400)},3600)}
function copyText(t){const done=()=>toast('تم النسخ إلى الحافظة','ok');
if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(done).catch(function(){fbCopy(t,done)})}else fbCopy(t,done);
function fbCopy(x,cb){const ta=document.createElement('textarea');ta.value=x;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}ta.remove();cb()}}
function beep(){try{const c=new (window.AudioContext||window.webkitAudioContext)();const o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.value=.04;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.12)}catch(e){}}
const apiBase=()=>(cfg&&cfg.url)?cfg.url.replace(/\/+$/,'')+'/functions/v1':null;
function busy(btn,label){if(!btn)return null;var old=btn.innerHTML;btn.disabled=true;btn.innerHTML=label;return function(){btn.disabled=false;btn.innerHTML=old}}
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function loadScriptOnce(src,checkFn){
return new Promise(function(res,rej){
if(checkFn&&checkFn()){res();return}
function poll(n){if(checkFn&&checkFn()){res();return}if(n<=0){rej(new Error('انتهت مهلة تحميل المكتبة'));return}setTimeout(function(){poll(n-1)},100)}
var exist=document.querySelector('script[src="'+src+'"]');
if(exist){poll(30);return}
var s=document.createElement('script');s.src=src;s.async=true;
s.onload=function(){poll(10)};
s.onerror=function(){rej(new Error('تعذر تحميل المكتبة: '+src))};
document.head.appendChild(s);});}
async function ensureLib(checkFn,urls){
if(checkFn())return true;
for(var i=0;i<urls.length;i++){try{await loadScriptOnce(urls[i],checkFn);if(checkFn())return true}catch(e){console.warn('lib load failed:',urls[i],e)}}
return checkFn();}
/* ================= Icons ================= */
const IC={
home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
chat:'<path d="M21 12a8 8 0 0 1-8 8H4l1.5-3.5A8 8 0 1 1 21 12z"/>',
bot:'<rect x="5" y="8" width="14" height="10" rx="3"/><path d="M12 8V5M9 5h6"/><circle cx="9.5" cy="12.5" r="1"/><circle cx="14.5" cy="12.5" r="1"/>',
widget:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 21h8"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9.5" r="2.8"/><path d="M15.5 14.6a5.5 5.5 0 0 1 6 5.4"/>',
book:'<path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M9 7h7"/>',
chart:'<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>',
gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2"/>',
card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h5"/>',
send:'<path d="m5 12 14-7-4 7 4 7z"/>',
copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
edit:'<path d="M4 20h4L20 8l-4-4L4 16z"/>',
code:'<path d="m8 8-5 4 5 4M16 8l5 4-5 4M13 5l-2 14"/>',
shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
spark:'<path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18-3-4-3-14.5 0-18z"/>',
check:'<path d="m5 13 4 4L19 7"/>',
menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
out:'<path d="M15 12H4m0 0 3-3m-3 3 3 3"/><path d="M9 4h10v16H9"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
doc:'<path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/>',
db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
refresh:'<path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/>'};
const icon=(n,c)=>'<svg class="'+(c||'w-5 h-5')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+IC[n]+'</svg>';
/* ================= Static ================= */
const AV_LOCAL=[
'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="24" fill="#0ABAB5"/><path d="M48 24l6.6 17.4L72 48l-17.4 6.6L48 72l-6.6-17.4L24 48l17.4-6.6z" fill="#12151a"/></svg>'),
'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="24" fill="#077f7c"/><circle cx="48" cy="40" r="16" fill="#e6fbfa"/><rect x="24" y="60" width="48" height="20" rx="10" fill="#e6fbfa"/></svg>'),
'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="24" fill="#0b514f"/><rect x="28" y="28" width="40" height="30" rx="10" fill="#8aeae6"/><circle cx="40" cy="43" r="4" fill="#0b514f"/><circle cx="56" cy="43" r="4" fill="#0b514f"/><rect x="36" y="62" width="24" height="8" rx="4" fill="#8aeae6"/></svg>')];
const AVT=AV_LOCAL;
const NO_INFO_MSG='عذراً، هذه المعلومة غير متوفرة لدي حالياً، هل أستطيع تحويلك لأحد موظفي الدعم؟';
const PLANS={
free:{name:'البداية',price:0,agents:6,msgs:500,feat:['حتى 6 Agents','رصيد ردود يُشترى مرة واحدة','Knowledge Base أساسية','شعار إدارة سوشيال في الويدجت']},
growth:{name:'النمو',price:0,agents:10,msgs:5000,feat:['حتى 10 Agents','خصم على حزم الردود','Knowledge Base متقدمة + RAG','إزالة شعار إدارة سوشيال','تحويل لموظف (Handoff)','تحليلات متقدمة']},
pro:{name:'الاحترافي',price:0,agents:999,msgs:50000,feat:['Agents غير محدودين','أفضل سعر للرد','API كامل + Webhooks','أولوية دعم + SLA','نماذج AI متعددة','تصدير البيانات']}};
/* حزم الردود — بدون اشتراك شهري */
const PKGS=[
{id:'starter',name:'حزمة البداية',credits:1000,price:30,popular:false},
{id:'growth',name:'حزمة النمو',credits:5000,price:120,popular:true},
{id:'pro',name:'حزمة الاحتراف',credits:20000,price:400,popular:false},
{id:'enterprise',name:'حزمة المؤسسات',credits:100000,price:1500,popular:false}];
const AI_MODELS=['gemini-2.5-flash-lite','gemini-2.5-flash','gemini-2.0-flash','gemini-1.5-pro'];
const CLASSES=['استفسار عام','مهتم','عميل محتمل','مشتري','عميل حالي','يحتاج متابعة','غير مهتم'];
const AUTO_TAGS=new Set(['سأل عن السعر','سأل عن التوصيل','سأل عن الدفع','نية شراء','طلب موظف']);
const KB_STATUSES={pending:'بانتظار البدء',uploading:'جارٍ الرفع',processing:'جارٍ المعالجة',embedding:'جارٍ إنشاء التضمينات',ready:'جاهز',error:'فشل'};
/* ================= Supabase ================= */
let cfg=null;try{cfg=JSON.parse(lsGet('aown_cfg'))}catch(e){}
if(window.getSupabaseConfig){var extCfg=window.getSupabaseConfig();
if(extCfg&&extCfg.url&&extCfg.key&&(!cfg||!cfg.url||!cfg.key)){cfg={url:extCfg.url,key:extCfg.key};lsSet('aown_cfg',JSON.stringify(cfg));console.log('[Supabase] تم تحميل الإعدادات من js/supabase-client.js')}}
let sb=null, remoteUser=null, remoteBroken=false;
function sbClient(){
if(!cfg||!cfg.url||!cfg.key){console.warn('[Supabase] لا توجد إعدادات اتصال — أدخلها من #/setup أو من js/supabase-client.js');return null}
if(!window.supabase){console.error('[Supabase] مكتبة Supabase لم تُحمّل — تحقق من الإنترنت أو CDN');return null}
if(!sb){try{sb=window.supabase.createClient(cfg.url,cfg.key);console.log('[Supabase] تم إنشاء العميل بنجاح →',cfg.url)}catch(e){console.error('[Supabase] فشل إنشاء العميل:',e.message);return null}}
return sb}
const isRemote=()=>!!sbClient();
function useLocalMode(){cfg=null;sb=null;remoteBroken=false;closeModal();toast('تم التحويل للوضع المحلي — بياناتك تُحفظ على هذا الجهاز','ok');route()}
function authNetFail(msg){
modal('<h3 class="font-display font-bold text-lg mb-2">تعذر الاتصال بالخادم</h3>'
+'<p class="text-sm text-ink-300 leading-7 mb-2">'+esc(arErr(msg))+'</p>'
+'<p class="text-xs text-ink-500 leading-6 mb-4">يمكنك إعادة المحاولة عند عودة الاتصال، أو المتابعة فورًا بالوضع المحلي حيث تُحفظ الحسابات والبيانات على جهازك.</p>'
+'<div class="flex gap-2"><button data-action="modal-close" class="btn-ghost flex-1">إغلاق وإعادة المحاولة</button><button data-action="local-mode" class="btn-primary flex-1">المتابعة بالوضع المحلي</button></div>');}
/* ================= Local DB ================= */
const LS='aown_db_v1';
let db;
function loadDB(){try{db=JSON.parse(lsGet(LS))}catch(e){db=null}
if(!db||typeof db!=='object'){db={users:[],session:null,ws:null,demo:false};persist()}
if(typeof db.demo==='undefined')db.demo=false}
function persist(){lsSet(LS,JSON.stringify(db))}
function me(){
if(isRemote())return remoteUser?{id:remoteUser.id,name:((remoteUser.email||'مستخدم').split('@')[0]),email:remoteUser.email,demo:false}:null;
if(db&&db.demo)return {id:'demo',name:'زائر تجريبي',email:'demo@social.app',demo:true};
return db.users.find(function(u){return u.id===db.session})}
const ws=()=>db.ws;
function defWidget(agentId,name){return {id:uid('w_'),agentId:agentId,name:name,token:uid('tk_'),enabled:true,
primary:'#0ABAB5',secondary:'#0b514f',header:'',bg:'#1a1e24',userBg:'#22272f',aiBg:'',text:'#e8eaed',
shadow:true,border:false,buttonSize:56,radius:16,width:360,height:520,position:'bottom-left',
avatar:'',logo:'',welcome:'',placeholder:'اكتب رسالتك...',offline:'نحن غير متصلين حاليًا، اترك رسالتك وسنرد عليك قريبًا.',
online:true,typing:true,autoOpen:false,delay:3,badge:true,sound:false,mobile:'panel',createdAt:now()}}
function chunkify(doc){doc.chunks=String(doc.content||'').split(/\n+/).map(function(s){return s.trim()}).filter(function(s){return s.length>3}).map(function(s){return {text:s,toks:tokens(s)}});doc.chunkCount=doc.chunks.length}
function starterKit(){
const a1={id:uid('ag_'),__demo:true,name:'موظف المبيعات',desc:'يرد على استفسارات الزوار ويساعدهم في اختيار المنتجات والأسعار.',avatar:AVT[0],instructions:'أنت موظف مبيعات. أجب بإيجاز وود من قاعدة المعرفة فقط، ولا تذكر أسعارًا أو منتجات غير موجودة في قاعدة المعرفة.',language:'العربية',tone:'ودي واحترافي',model:'gemini-2.5-flash-lite',welcome:'أهلًا بك في إدارة ســوشـــيــــال 👋 كيف أقدر أساعدك اليوم؟',fallback:NO_INFO_MSG,createdAt:now()};
const a2={id:uid('ag_'),__demo:true,name:'دعم العملاء',desc:'يتابع الطلبات وسياسات الشحن والاسترجاع ويصعّد الحالات الحساسة.',avatar:AVT[1],instructions:'أنت موظف دعم عملاء. التزم بالسياسات الموثقة فقط، وحوّل الحالات الغاضبة لموظف بشري.',language:'العربية',tone:'هادئ ومتعاطف',model:'gemini-2.5-flash-lite',welcome:'مرحبًا 🤍 أنا هنا لمساعدتك بأي استفسار.',fallback:NO_INFO_MSG,createdAt:now()};
const w1=defWidget(a1.id,'ويدجت المتجر');w1.__demo=true;
const w2=defWidget(a2.id,'ويدجت الدعم');w2.primary='#089e9a';w2.__demo=true;
const kb=[
{id:uid('kb_'),__demo:true,name:'المنتجات والأسعار',type:'text',agentId:a1.id,createdAt:now(),lastSync:now(),status:'ready',error:'',content:'سماعة بلوتوث برو بسعر 199 ريال.\nشاحن سريع 45 واط بسعر 89 ريال.\nحقيبة لابتوب مقاومة للماء بسعر 149 ريال.\nعرض الباندل: سماعة + شاحن بسعر 259 ريال.'},
{id:uid('kb_'),__demo:true,name:'سياسة الشحن والتوصيل',type:'text',agentId:'',createdAt:now(),lastSync:now(),status:'ready',error:'',content:'التوصيل داخل الرياض خلال 24 ساعة برسوم 15 ريال.\nالشحن مجاني للطلبات فوق 200 ريال.\nباقي المدن من 2 إلى 4 أيام عمل.'},
{id:uid('kb_'),__demo:true,name:'سياسة الاسترجاع',type:'text',agentId:'',createdAt:now(),lastSync:now(),status:'ready',error:'',content:'يمكن استرجاع المنتج خلال 14 يومًا بحالته الأصلية.\nيتم استرداد المبلغ خلال 5 إلى 7 أيام عمل.\nالمنتجات الشخصية غير قابلة للاسترجاع.'}];
kb.forEach(chunkify);
return {agents:[a1,a2],widgets:[w1,w2],kb:kb,contacts:[],convos:[],
settings:{name:'مساحة عملي',type:'متجر إلكتروني',lang:'العربية',tz:'Asia/Riyadh',team:[],
onboarded:false,onboardingStep:1,obStep:1,obBuilt:false,onboardingAgentId:null,onboardingWidgetId:null,obAgentId:null,obWidgetId:null,goals:[],channels:['widget']},
plan:'free',usage:{ai:0},invoices:[],credits_balance:20,credits_used:0,credit_history:[]};
}
/* ================= Remote sync ================= */
let pushTimer=null;
function save(){
persist();
if(isRemote()&&!remoteBroken&&db.ws&&db.ws.__wid){
clearTimeout(pushTimer);
pushTimer=setTimeout(function(){
pushTables(sbClient(),db.ws.__wid,db.ws).then(function(){
if(remoteBroken){remoteBroken=false;toast('عادت المزامنة مع الخادم ✔','ok');route()}
}).catch(function(err){
if(!remoteBroken){remoteBroken=true;toast('انقطعت المزامنة مع الخادم — تم الحفظ محليًا مؤقتًا. أعد المحاولة من الشريط الجانبي.','err');console.error(err);route()}})},700);}}
async function pushTables(c,wid,s){
const T={agents:s.agents,widgets:s.widgets,knowledge_docs:s.kb,contacts:s.contacts,conversations:s.convos,invoices:s.invoices};
for(const t in T){
const r1=await c.from(t).delete().eq('workspace_id',wid);if(r1.error)throw r1.error;
if(T[t]&&T[t].length){const r2=await c.from(t).insert(T[t].map(function(x){return {id:x.id,workspace_id:wid,data:x}}));if(r2.error)throw r2.error;}}
const r3=await c.from('workspaces').update({name:s.settings.name,type:s.settings.type,lang:s.settings.lang,tz:s.settings.tz,team:s.settings.team,plan:s.plan,usage_ai:s.usage.ai,credits_balance:s.credits_balance||0,credits_used:s.credits_used||0}).eq('id',wid);
if(r3.error)throw r3.error;}
async function loadRemote(){
const c=sbClient();if(!c||!remoteUser)return false;
const prevSet=(db&&db.ws&&db.ws.settings)?db.ws.settings:null;
const prevHist=(db&&db.ws&&db.ws.credit_history)||[];
let q;
try{q=await c.from('workspaces').select('*').eq('owner_id',remoteUser.id).maybeSingle()}
catch(e){toast('تعذر الوصول إلى قاعدة البيانات — تحقق من الإنترنت','err');return false}
if(q.error){toast(/permission|policy/i.test(q.error.message)?'خطأ صلاحيات — تأكد من تفعيل سياسات RLS':'تعذر الاتصال بقاعدة البيانات','err');return false}
let wsRow=q.data;
if(!wsRow){wsRow=await provisionRemote(c);if(!wsRow)return false}
db.ws={__wid:wsRow.id,settings:{name:wsRow.name||'مساحة عمل',type:wsRow.type||'',lang:wsRow.lang||'العربية',tz:wsRow.tz||'Asia/Riyadh',team:wsRow.team||[],
onboarded:(prevSet&&prevSet.onboarded===true),goals:(prevSet&&prevSet.goals)||[],channels:(prevSet&&prevSet.channels)||['widget'],
onboardingStep:(prevSet&&prevSet.onboardingStep)||1,obStep:(prevSet&&prevSet.obStep)||1,obBuilt:!!(prevSet&&prevSet.obBuilt),
onboardingAgentId:(prevSet&&prevSet.onboardingAgentId)||null,onboardingWidgetId:(prevSet&&prevSet.onboardingWidgetId)||null,
obAgentId:(prevSet&&prevSet.obAgentId)||null,obWidgetId:(prevSet&&prevSet.obWidgetId)||null},
plan:wsRow.plan||'free',usage:{ai:wsRow.usage_ai||0},agents:[],widgets:[],kb:[],contacts:[],convos:[],invoices:[],
credits_balance:wsRow.credits_balance!=null?wsRow.credits_balance:20,credits_used:wsRow.credits_used||0,credit_history:prevHist};
const tabs=[['agents','agents'],['widgets','widgets'],['knowledge_docs','kb'],['contacts','contacts'],['conversations','convos'],['invoices','invoices']];
for(const p of tabs){const r=await c.from(p[0]).select('data').eq('workspace_id',wsRow.id);db.ws[p[1]]=(r.data||[]).map(function(x){return x.data})}
db.ws.convos.sort(function(a,b){return (b.updatedAt||0)-(a.updatedAt||0)});
return true;}
async function provisionRemote(c){
const kit=starterKit();
const r=await c.from('workspaces').insert({owner_id:remoteUser.id,name:kit.settings.name,type:kit.settings.type,lang:kit.settings.lang,tz:kit.settings.tz,team:kit.settings.team,plan:'free',usage_ai:0,credits_balance:20,credits_used:0}).select().single();
if(r.error){toast('تعذر إنشاء مساحة العمل: '+r.error.message,'err');return null}
await pushTables(c,r.data.id,kit);return r.data;}
async function sbUpsert(table,row){
const c=sbClient();if(!c||!db.ws||!db.ws.__wid)throw new Error('الاتصال بقاعدة البيانات غير متوفر');
const clean=Object.assign({},row);delete clean.__unsynced;
const r=await c.from(table).upsert({id:clean.id,workspace_id:db.ws.__wid,data:clean},{onConflict:'id'});
if(r.error)throw new Error(r.error.message||'فشل الحفظ في قاعدة البيانات');}
async function sbDeleteRow(table,id){
const c=sbClient();if(!c||!db.ws||!db.ws.__wid)throw new Error('الاتصال بقاعدة البيانات غير متوفر');
const r=await c.from(table).delete().eq('id',id);if(r.error)throw new Error(r.error.message||'فشل الحذف من قاعدة البيانات');}
async function syncWidgetToServer(w){
const ag=ws().agents.find(function(a){return a.id===w.agentId});
if(ag)await sbUpsert('agents',ag);
await sbUpsert('widgets',w);
if(w.__unsynced)delete w.__unsynced;}
/* ================= CRM ================= */
function classifyConvo(c){
const t=norm((c.messages||[]).filter(function(m){return m.from==='visitor'}).map(function(m){return String(m.text||'')}).join(' '));
let score=0;const tags=[];
if(/(سعر|بكم|يكلف|تكلف)/.test(t)){score+=10;tags.push('سأل عن السعر')}
if(/(توصيل|شحن|يوصل)/.test(t)){score+=15;tags.push('سأل عن التوصيل')}
if(/(دفع|فيزا|مدي|بطاقه|كاش|تحويل بنكي)/.test(t)){score+=20;tags.push('سأل عن الدفع')}
if(/(اريد اطلب|ابغي اطلب|ابى اطلب|اطلب الان|اشتري|اريد الشراء|احجز)/.test(t)){score+=40;tags.push('نية شراء')}
if(/(موظف|انسان|بشري)/.test(t))tags.push('طلب موظف');
score=Math.min(score,100);
let cls='استفسار عام';
if(c.status==='handoff')cls='يحتاج متابعة';
else if(score>=60)cls='مشتري';else if(score>=40)cls='عميل محتمل';else if(score>=15)cls='مهتم';
return {score:score,cls:cls,tags:tags};}
function updateCustomerInsights(convo){
const s=ws();if(!s||!convo)return;
const cust=s.contacts.find(function(x){return x.id===convo.contactId});if(!cust)return;
const r=classifyConvo(convo);
cust.leadScore=r.score;cust.class=r.cls;cust.lastSeen=now();
const manual=(cust.tags||[]).filter(function(tg){return !AUTO_TAGS.has(tg)});
cust.tags=[...new Set(manual.concat(r.tags))].slice(0,12);}
/* ================= AI Engine ================= */
const DEMO_TEXTS=['سماعة بلوتوث برو بسعر 199 ريال.\nشاحن سريع 45 واط بسعر 89 ريال.\nعرض الباندل: سماعة + شاحن بسعر 259 ريال.','التوصيل داخل الرياض خلال 24 ساعة برسوم 15 ريال.\nالشحن مجاني للطلبات فوق 200 ريال.','يمكن استرجاع المنتج خلال 14 يومًا بحالته الأصلية.','الدوام من السبت إلى الخميس، 9 صباحًا حتى 6 مساءً.'];
function demoDocs(){return DEMO_TEXTS.map(function(t){return {agentId:'',chunks:t.split('\n').map(function(s){return {text:s,toks:tokens(s)}})}})}
function searchKB(q,agentId){
const qt=tokens(q);if(!qt.length)return[];const hits=[];
const s=ws();
const ready=(s&&Array.isArray(s.kb))?s.kb.filter(function(k){return k.status==='ready'&&(!k.agentId||k.agentId===agentId)}):[];
const src=ready.length?ready:(s?[]:demoDocs());
src.forEach(function(d){(d.chunks||[]).forEach(function(ch){
var sc=0;
qt.forEach(function(t){ch.toks.forEach(function(ct){
var tt=t.length>3?t.replace(/^ال/,''):t;
var cc=ct.length>3?ct.replace(/^ال/,''):ct;
if(ct===t)sc+=3;
else if(ct.indexOf(t)>-1||t.indexOf(ct)>-1)sc+=2;
else if(tt.length>2&&cc.length>2&&(cc.indexOf(tt)>-1||tt.indexOf(cc)>-1))sc+=1;})});
if(sc>0)hits.push({sc:sc,text:ch.text})})});
return hits.sort(function(a,b){return b.sc-a.sc}).slice(0,2);}
const HANDOFF=['موظف','انسان','بشري','شخص حقيقي','مختص','مسؤول'];
function aiRespondLocal(text,agent,agentId){
const t=norm(text);
if(HANDOFF.some(function(k){return t.indexOf(norm(k))>-1}))return {text:'أكيد، حولتك للموظف المختص الآن ✋ سيتابع معك خلال دقائق.',handoff:true};
if(/^(سلام|هلا|مرحبا|اهلا|هاي|صباح الخير|مساء الخير)/.test(t)&&t.length<15)return {text:'أهلًا وسهلًا 👋 كيف أقدر أساعدك؟'};
if(t.indexOf('شكرا')>-1&&t.length<25)return {text:'العفو 🤍 أي شيء ثاني أنا هنا.'};
const hits=searchKB(text,agentId);
if(hits.length&&hits[0].sc>=1)return {text:hits.map(function(h){return h.text}).join('\n')};
return {text:NO_INFO_MSG};}
async function getAIReply(text,agent,widget,convo){
if(isRemote()&&cfg&&apiBase()&&widget){
try{
const res=await fetch(apiBase()+'/ai-respond',{method:'POST',headers:{'Content-Type':'application/json','api-key':cfg.key},body:JSON.stringify({widget_id:widget.id,token:widget.token,message:text,conversation_id:convo?convo.id:null})});
const j=await res.json().catch(function(){return{}});
if(j&&j.handoff_locked)return {text:j.message||'المحادثة بيد فريق الدعم الآن.',system:true};
if(j&&j.error==='no_credits')return {text:j.message||'رصيدك من الردود نفد. اشترِ حزمة جديدة من صفحة الرصيد.',system:true};
if(j&&j.error==='limit')return {text:j.message||'تم تجاوز الحد الشهري لرسائل الذكاء الاصطناعي. الرجاء ترقية الخطة.',system:true};
if(j&&j.error){console.warn('ai-respond error → fallback للمحرك المحلي:',j.error);throw new Error(j.message||j.error)}
if(j&&j.reply){if(j.handoff&&convo)convo.status='handoff';return {text:j.reply,handoff:!!j.handoff}}
throw new Error('استجابة غير صالحة من الخادم');
}catch(e){console.warn('ai-respond fallback:',e&&e.message)}
}
return new Promise(function(resolve){setTimeout(function(){resolve(aiRespondLocal(text,agent,widget?widget.agentId:undefined))},600)});}
/* ================= Knowledge Processing ================= */
function refreshKbUI(){var h=location.hash||'';if(h.indexOf('#/app/kb')===0||h.indexOf('#/onboarding')===0)route()}
async function fetchPage(url){
try{
const ctl=(typeof AbortController!=='undefined')?new AbortController():null;
const to=ctl?setTimeout(function(){ctl.abort()},12000):null;
const r=await fetch(url,{mode:'cors',signal:ctl?ctl.signal:undefined});
if(to)clearTimeout(to);
if(r.ok){const ct=(r.headers.get('content-type')||'');if(ct.indexOf('html')>-1||ct.indexOf('text')>-1||ct==='')return await r.text()}
throw new Error('direct');
}catch(e){
const proxy='https://api.allorigins.win/get?url='+encodeURIComponent(url);
const r2=await fetch(proxy);
if(!r2.ok)throw new Error('تعذر الوصول إلى الموقع');
const j=await r2.json().catch(function(){return null});
if(j&&j.contents)return j.contents;
throw new Error('تعذر جلب محتوى الموقع');}}
function extractHtml(html,baseUrl){
const d=new DOMParser().parseFromString(html,'text/html');
d.querySelectorAll('script,style,noscript,svg,iframe,nav,footer,form,button,header').forEach(function(n){n.remove()});
const titleEl=d.querySelector('title');
const title=titleEl?(titleEl.textContent||'').trim():'';
const body=d.querySelector('main')||d.querySelector('body')||d.documentElement;
const text=((title?title+'\n':'')+(body?body.textContent:'')).replace(/\s+/g,' ').trim();
let origin='';try{origin=new URL(baseUrl).origin}catch(e){}
const links=Array.from(d.querySelectorAll('a[href]')).map(function(a){try{return new URL(a.getAttribute('href'),baseUrl).toString()}catch(e){return null}}).filter(function(x){return x&&origin&&x.indexOf(origin)===0});
return {text:text,links:links};}
async function crawlLocal(url,doc){
const origin=new URL(url).origin;
const visited=new Set();const queue=[url];const pages=[];
while(queue.length&&visited.size<10){
const next=queue.shift();let u;try{u=new URL(next)}catch(e){continue}
const key=u.origin+u.pathname;
if(u.origin!==origin||visited.has(key))continue;
visited.add(key);
try{
const html=await fetchPage(u.toString());
const res=extractHtml(html,u.toString());
if(res.text.length>40)pages.push('صفحة: '+u.pathname+'\n'+res.text.slice(0,20000));
res.links.forEach(function(l){queue.push(l)});
}catch(e){}}
if(!pages.length)throw new Error('الموقع لا يحتوي نصًا كافيًا — قد يعتمد على JavaScript في عرض المحتوى');
doc.content=pages.join('\n').slice(0,60000);
chunkify(doc);doc.pages=visited.size;doc.status='ready';doc.lastSync=now();}
function urlFallbackModal(docId){
var d=ws().kb.find(function(x){return x.id===docId});if(!d)return;
modal('<h3 class="font-display font-bold text-lg mb-2">تعذر قراءة الموقع تلقائيًا</h3>'
+'<p class="text-xs text-ink-400 leading-6 mb-1">الرابط: <span class="ltr text-tiffany-300">'+esc(d.name)+'</span></p>'
+'<p class="text-xs text-ink-500 leading-6 mb-3">قد يمنع الموقع القراءة الآلية أو لا يتوفر اتصال كافٍ. الصق محتوى الموقع بنفسك وسيُضاف فورًا كمصدر معرفة جاهز.</p>'
+'<form id="f-urlfallback" class="space-y-3"><input type="hidden" name="docId" value="'+d.id+'">'
+'<textarea name="content" rows="9" required class="inp-s" placeholder="الصق هنا نصوص الموقع: المنتجات، الأسعار، الخدمات، السياسات، أوقات العمل..."></textarea>'
+'<div class="flex gap-2"><button class="btn-primary flex-1">حفظ كمصدر معرفة</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');}
async function processUrl(url,doc){
doc.status='processing';doc.error='';doc.content='جارٍ الزحف واستخراج المعلومات...';save();refreshKbUI();
try{
if(isRemote()&&cfg&&apiBase()&&db.ws&&db.ws.__wid){
try{
const resp=await fetch(apiBase()+'/kb-crawl',{method:'POST',headers:{'Content-Type':'application/json','api-key':cfg.key},body:JSON.stringify({url:url,doc_id:doc.id,workspace_id:db.ws.__wid,agent_id:doc.agentId||null})});
const j=await resp.json().catch(function(){return null});
if(resp.ok&&j&&j.ok){doc.status='ready';doc.chunkCount=j.chunks||0;doc.pages=j.pages||1;doc.lastSync=now();doc.content='تم الزحف عبر الخادم — '+(j.pages||1)+' صفحة، '+(j.chunks||0)+' مقطعًا مع تضمينات دلالية.';save();refreshKbUI();toast('تم زحف الموقع ومعالجته ✔','ok');return;}
throw new Error(arErr((j&&j.message)||('فشل الزحف ('+resp.status+')')));
}catch(re){console.warn('kb-crawl غير متوفر على الخادم — سيتم الزحف محليًا:',re.message);}
}
await crawlLocal(url,doc);
save();refreshKbUI();
toast('تم استخراج معلومات الموقع ✔ — '+doc.chunkCount+' مقطع من '+(doc.pages||1)+' صفحة','ok');
}catch(err){
console.error('KB crawl error:',err);
doc.status='error';doc.error=arErr(err.message||String(err));doc.content='فشل الزحف: '+doc.error;
save();refreshKbUI();
toast('فشل الزحف التلقائي — أضف محتوى الموقع يدويًا','err');
urlFallbackModal(doc.id);}}
async function extractFileClient(file){
const ext=(file.name.split('.').pop()||'').toLowerCase();
if(ext==='txt'||ext==='csv'||ext==='md'){
const t=await file.text();
if(t&&t.trim())return t;
throw new Error('الملف فارغ أو بترميز غير مدعوم');}
if(ext==='pdf'){
const ok=await ensureLib(function(){return !!window.pdfjsLib},['https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js']);
if(ok){
try{
window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
const buf=await file.arrayBuffer();
const pdf=await window.pdfjsLib.getDocument({data:buf}).promise;
let out='';
for(let i=1;i<=Math.min(pdf.numPages,200);i++){const page=await pdf.getPage(i);const tc=await page.getTextContent();out+=tc.items.map(function(it){return it.str}).join(' ')+'\n';}
if(out.trim())return out;
}catch(e){console.warn('pdf primary failed:',e)}}
try{
const raw=await file.text();
const naive=raw.replace(/[^\u0600-\u06FFa-zA-Z0-9\n.,()\-:%]/g,' ').replace(/ {3,}/g,'\n').replace(/\n{3,}/g,'\n').trim();
if(naive.length>200)return naive;
}catch(e2){}
throw new Error('تعذر استخراج النص من ملف PDF — إن كان صورًا ضوئية فحوّله إلى PDF نصي أولًا');}
if(ext==='docx'){
const ok=await ensureLib(function(){return !!window.mammoth},['https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js','https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js']);
if(ok){
try{
const buf=await file.arrayBuffer();
const r=await window.mammoth.extractRawText({arrayBuffer:buf});
if(r.value&&r.value.trim())return r.value;
}catch(e){console.warn('mammoth failed:',e)}}
const zok=await ensureLib(function(){return !!window.JSZip},['https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js']);
if(zok){
try{
const buf=await file.arrayBuffer();
const zip=await window.JSZip.loadAsync(buf);
const xf=zip.file('word/document.xml');
if(xf){
const xml=await xf.async('string');
const txt=xml.replace(/<w:tab[^>]*\/>/g,'\t').replace(/<\/w:p>/g,'\n').replace(/<[^>]+>/g,'')
.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').trim();
if(txt)return txt;}
}catch(e2){console.warn('jszip docx fallback failed:',e2)}}
throw new Error('تعذر استخراج النص من ملف DOCX — جرّب تصديره كنص عادي (.txt)');}
if(ext==='xlsx'||ext==='xls'){
const ok=await ensureLib(function(){return !!window.XLSX},['https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js']);
if(ok){
try{
const buf=await file.arrayBuffer();
const wb=window.XLSX.read(buf,{type:'array'});
let out='';wb.SheetNames.forEach(function(sn){out+='\n['+sn+']\n'+window.XLSX.utils.sheet_to_csv(wb.Sheets[sn])});
if(out.trim())return out;
}catch(e){console.warn('xlsx failed:',e)}}
const zok2=await ensureLib(function(){return !!window.JSZip},['https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js']);
if(zok2){
try{
const buf=await file.arrayBuffer();
const zip=await window.JSZip.loadAsync(buf);
const ss=zip.file('xl/sharedStrings.xml');
let out='';
if(ss){const xml=await ss.async('string');
const m=xml.match(/<t[^>]*>([^<]*)<\/t>/g)||[];
out=m.map(function(x){return x.replace(/<[^>]+>/g,'')}).join('\n');}
if(out.trim())return out;
}catch(e2){console.warn('jszip xlsx fallback failed:',e2)}}
throw new Error('تعذر استخراج البيانات من ملف Excel — جرّب تصديره بصيغة CSV');}
try{
const t=await file.text();
const clean=t.replace(/[^\u0600-\u06FFa-zA-Z0-9\n.,()\-:%\r]/g,' ');
if(clean.trim().length>40)return clean;
}catch(e3){}
throw new Error('نوع الملف غير مدعوم: '+ext);}
async function processFile(file,agentId){
const s=ws();
const doc={id:uid('kb_'),name:file.name,type:'file',agentId:agentId||'',content:'',status:'pending',chunks:[],chunkCount:0,createdAt:now(),size:file.size,error:'',storagePath:''};
s.kb.unshift(doc);save();refreshKbUI();
try{
if(isRemote()&&cfg&&apiBase()&&db.ws&&db.ws.__wid){
try{
doc.status='uploading';save();refreshKbUI();
const c=sbClient();
const safe=file.name.replace(/[^\w.\-\u0600-\u06FF]+/g,'_');
const path=db.ws.__wid+'/'+doc.id+'/'+safe;
const up=await c.storage.from('kb-files').upload(path,file,{upsert:true});
if(up.error)throw new Error('فشل رفع الملف: '+up.error.message);
doc.storagePath=path;doc.status='processing';save();refreshKbUI();
const resp=await fetch(apiBase()+'/kb-process',{method:'POST',headers:{'Content-Type':'application/json','api-key':cfg.key},body:JSON.stringify({doc_id:doc.id,path:path,name:file.name,agent_id:agentId||null,workspace_id:db.ws.__wid})});
const j=await resp.json().catch(function(){return null});
if(resp.ok&&j&&j.ok&&j.chunks){doc.status='ready';doc.chunkCount=j.chunks;doc.lastSync=now();doc.content='تم استخراج النص وإنشاء '+j.chunks+' مقطعًا مع تضمينات دلالية.';save();refreshKbUI();toast('تمت معالجة الملف ✔ — '+j.chunks+' مقطع','ok');return;}
throw new Error(arErr((j&&j.message)||('فشل معالجة الملف ('+resp.status+')')));
}catch(re){console.warn('kb-process غير متوفر على الخادم — ستتم المعالجة محليًا:',re.message);}
}
doc.status='processing';save();refreshKbUI();
const text=await extractFileClient(file);
if(!text||!text.trim())throw new Error('الملف لا يحتوي نصًا قابلًا للاستخراج');
doc.content=text.slice(0,120000);chunkify(doc);doc.status='ready';doc.lastSync=now();
save();refreshKbUI();toast('تمت معالجة الملف ✔ — '+doc.chunkCount+' مقطع أصبح جاهزًا للويدجت','ok');
}catch(err){
console.error('KB file error:',err);
doc.status='error';doc.error=arErr(err.message||String(err));doc.content='فشلت المعالجة: '+doc.error;
save();refreshKbUI();toast(doc.error,'err');}}
async function processTextDoc(title,content,agentId){
const doc={id:uid('kb_'),name:title||content.slice(0,60),type:'text',agentId:agentId||'',content:content,status:'processing',chunks:[],chunkCount:0,createdAt:now(),error:''};
ws().kb.unshift(doc);save();refreshKbUI();
try{
if(isRemote()&&cfg&&apiBase()&&db.ws&&db.ws.__wid){
try{
const resp=await fetch(apiBase()+'/kb-ingest',{method:'POST',headers:{'Content-Type':'application/json','api-key':cfg.key},body:JSON.stringify({doc_id:doc.id,text:content,agent_id:agentId||null,workspace_id:db.ws.__wid})});
const j=await resp.json().catch(function(){return null});
if(resp.ok&&j&&j.ok&&j.chunks){doc.status='ready';doc.chunkCount=j.chunks||0;doc.lastSync=now();save();refreshKbUI();toast('تم حفظ المعرفة ✔ — '+doc.chunkCount+' مقطع','ok');return true;}
throw new Error(arErr((j&&j.message)||('فشل حفظ المعرفة ('+resp.status+')')));
}catch(re){console.warn('kb-ingest غير متوفر على الخادم — ستتم المعالجة محليًا:',re.message);}
}
chunkify(doc);doc.status='ready';doc.lastSync=now();
save();refreshKbUI();toast('تم حفظ المعرفة ✔ — '+doc.chunkCount+' مقطع أصبح جاهزًا للويدجت','ok');return true;
}catch(err){
console.error('KB text error:',err);
doc.status='error';doc.error=arErr(err.message||String(err));
save();refreshKbUI();toast('فشل حفظ المعرفة: '+doc.error,'err');return false;}}
async function reIngestDoc(doc){
doc.status='processing';doc.error='';save();refreshKbUI();
try{
if(isRemote()&&cfg&&apiBase()&&db.ws&&db.ws.__wid){
try{
const resp=await fetch(apiBase()+'/kb-ingest',{method:'POST',headers:{'Content-Type':'application/json','api-key':cfg.key},body:JSON.stringify({doc_id:doc.id,text:doc.content,agent_id:doc.agentId||null,workspace_id:db.ws.__wid})});
const j=await resp.json().catch(function(){return null});
if(resp.ok&&j&&j.ok){doc.status='ready';doc.chunkCount=j.chunks||0;doc.lastSync=now();save();refreshKbUI();toast('تمت إعادة المعالجة ✔','ok');return;}
throw new Error(arErr((j&&j.message)||('فشل إعادة المعالجة ('+resp.status+')')));
}catch(re){console.warn('kb-ingest غير متوفر — معالجة محلية:',re.message);}
}
chunkify(doc);doc.status='ready';doc.lastSync=now();save();refreshKbUI();toast('تمت إعادة المعالجة ✔ — '+doc.chunkCount+' مقطع','ok');
}catch(err){console.error(err);doc.status='error';doc.error=arErr(err.message||String(err));save();refreshKbUI();toast('فشلت إعادة المعالجة: '+doc.error,'err');}}
async function reProcessFile(doc){
doc.status='processing';doc.error='';save();refreshKbUI();
try{
if(isRemote()&&cfg&&apiBase()&&db.ws&&db.ws.__wid&&doc.storagePath){
try{
const resp=await fetch(apiBase()+'/kb-process',{method:'POST',headers:{'Content-Type':'application/json','api-key':cfg.key},body:JSON.stringify({doc_id:doc.id,path:doc.storagePath,name:doc.name,agent_id:doc.agentId||null,workspace_id:db.ws.__wid})});
const j=await resp.json().catch(function(){return null});
if(resp.ok&&j&&j.ok){doc.status='ready';doc.chunkCount=j.chunks||0;doc.lastSync=now();doc.content='تم استخراج النص وإنشاء '+(j.chunks||0)+' مقطعًا.';save();refreshKbUI();toast('تمت إعادة المعالجة ✔','ok');return;}
throw new Error(arErr((j&&j.message)||('فشل المعالجة ('+resp.status+')')));
}catch(re){console.warn('kb-process غير متوفر — معالجة محلية:',re.message);}
}
if(doc.content&&!/فشلت|فشل/.test(doc.content)){chunkify(doc);doc.status='ready';doc.lastSync=now();save();refreshKbUI();toast('تمت إعادة المعالجة ✔ — '+doc.chunkCount+' مقطع','ok');return;}
throw new Error('لا يوجد محتوى محلي — ارفع الملف من جديد');
}catch(err){console.error(err);doc.status='error';doc.error=arErr(err.message||String(err));save();refreshKbUI();toast('فشلت إعادة المعالجة: '+doc.error,'err');}}
/* ================= Widget UI ================= */
function widgetMarkup(w,agent,opts){
opts=opts||{};
const name=w.name||((agent&&agent.name)||'مساعدك الذكي');
const r=w.radius||16;
const credit=opts.credit&&(!ws()||ws().plan==='free');
const W=Math.min(w.width||360,420),H=Math.min(w.height||520,640);
const headBg=w.header?w.header:('linear-gradient(135deg,'+(w.primary||'#0ABAB5')+','+(w.secondary||'#0b514f')+')');
const borderSt=w.border?('border:1px solid '+(w.primary||'#0ABAB5')):'border:1px solid rgba(255,255,255,.08)';
const footInner=(w.online===false)
?('<div class="text-xs text-ink-300 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center">'+esc(w.offline||'نحن غير متصلين حاليًا.')+'</div>')
:('<form class="w-form flex items-center gap-2" style="background:rgba(255,255,255,.04);border-radius:'+Math.max(r-6,8)+'px;padding:6px 8px">'
+'<input class="w-input flex-1 bg-transparent outline-none text-sm px-2 py-1.5 placeholder:text-ink-500 min-w-0" style="color:'+(w.text||'#e8eaed')+'" placeholder="'+esc(w.placeholder||'اكتب رسالتك...')+'" maxlength="500">'
+'<button type="submit" class="w-send p-2 rounded-xl text-white transition hover:opacity-85 flex-none" style="background:'+(w.primary||'#0ABAB5')+'" aria-label="إرسال">'+icon('send','w-4 h-4')+'</button></form>');
return '<div class="w-root flex flex-col '+(w.shadow===false?'':'shadow-soft')+' overflow-hidden msg-in" style="width:'+W+'px;height:'+H+'px;max-width:calc(100vw - 24px);max-height:72vh;border-radius:'+r+'px;'+borderSt+';background:'+(w.bg||'#1a1e24')+'">'
+'<div class="flex items-center gap-3 px-4 py-3" style="background:'+headBg+'">'
+'<div class="relative"><img src="'+(w.avatar||((agent&&agent.avatar)||AVT[0]))+'" class="w-10 h-10 rounded-full object-cover border-2 border-white/30" alt="" onerror="this.style.display=\'none\'">'+(w.online?'<span class="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white pulse-dot"></span>':'')+'</div>'
+'<div class="flex-1 min-w-0"><div class="font-display font-bold text-white text-sm truncate">'+esc(name)+'</div><div class="text-[11px] text-white/80">'+(w.online?'متصل الآن':'غير متصل')+'</div></div>'
+(w.logo?'<img src="'+w.logo+'" class="w-7 h-7 rounded-lg object-cover bg-white/10 p-0.5" alt="">':'')
+'<button type="button" data-action="w-close" class="text-white/80 hover:text-white p-1" aria-label="إغلاق">'+icon('x','w-4 h-4')+'</button></div>'
+'<div class="w-msgs flex-1 overflow-y-auto chat-scroll px-3 py-4 space-y-2" style="background:'+(w.bg||'#1a1e24')+'"></div>'
+'<div class="p-3 border-t border-white/5" style="background:'+(w.bg||'#1a1e24')+'">'
+(credit?'<div class="text-[10px] text-ink-500 text-center pb-1.5">مدعوم بواسطة <b class="text-tiffany-500">إدارة ســوشـــيــــال</b></div>':'')
+footInner+'</div></div>';}
function launcherMarkup(w){const bsz=(w.buttonSize||56)+'px';
return '<button type="button" data-action="w-open" class="relative rounded-full shadow-glow flex items-center justify-center transition hover:scale-105 flex-none" style="background:'+(w.primary||'#0ABAB5')+';width:'+bsz+';height:'+bsz+'" aria-label="فتح المحادثة">'
+'<svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a8 8 0 0 1-8 8H4l1.5-3.5A8 8 0 1 1 21 12z"/></svg>'
+(w.badge?'<span class="absolute -top-1 -left-1 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold text-white flex items-center justify-center" style="background:'+(w.secondary||'#0b514f')+'">1</span>':'')+'</button>'}
function mountWidget(host,w,agent,opts){
if(!host||!w)return null;
opts=opts||{};
const isRight=(opts.position||w.position)==='bottom-right';
host.innerHTML='<div class="w-wrap flex flex-col items-end gap-3" style="position:'+(opts.fixed?'fixed':'absolute')+';'+(isRight?'right:16px':'left:16px')+';bottom:16px;z-index:60">'
+'<div class="w-panel hidden">'+widgetMarkup(w,agent,{credit:opts.credit})+'</div>'+launcherMarkup(w)+'</div>';
const panel=host.querySelector('.w-panel'),msgs=host.querySelector('.w-msgs'),form=host.querySelector('.w-form'),input=host.querySelector('.w-input');
let convo=null,open=false,rl=[];
const agentOf=function(){if(agent)return agent;const s=ws();return s?s.agents.find(function(a){return a.id===w.agentId}):null};
const aiBg=function(){return w.aiBg||w.primary||'#0ABAB5'};
const userBg=function(){return w.userBg||'#22272f'};
function pushMsg(from,text){
const el=document.createElement('div');
if(from==='system'){el.className='msg-in flex';el.innerHTML='<div class="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 w-full text-center">'+esc(text)+'</div>';}
else{el.className='msg-in flex '+(from==='visitor'?'justify-start':'justify-end');
el.innerHTML='<div class="max-w-[85%] text-sm leading-6 px-3.5 py-2.5 rounded-2xl '+(from==='visitor'?'rounded-tr-sm':'rounded-tl-sm')+'" style="background:'+(from==='visitor'?userBg():aiBg())+';color:'+(from==='visitor'?(w.text||'#e8eaed'):'#fff')+'">'+md(text)+'</div>';}
msgs.appendChild(el);msgs.scrollTop=msgs.scrollHeight;}
function typing(on){let t=host.querySelector('.w-typing');
if(on&&!t){t=document.createElement('div');t.className='w-typing typing flex gap-1 px-3 py-2 text-ink-400';t.innerHTML='<span></span><span></span><span></span>';msgs.appendChild(t);msgs.scrollTop=msgs.scrollHeight}
if(!on&&t)t.remove()}
function ensureConvo(){if(convo||!opts.persist||!ws())return;
let vid=lsGet('aown_vid');if(!vid){vid=uid('v_');lsSet('aown_vid',vid)}
let c=ws().contacts.find(function(x){return x.vid===vid});
if(!c){c={id:uid('c_'),vid:vid,name:'زائر '+vid.slice(-4),email:'',phone:'',firstSeen:now(),lastSeen:now(),tags:[],notes:'',class:'استفسار عام',leadScore:0};ws().contacts.unshift(c)}
c.lastSeen=now();
convo={id:uid('cv_'),contactId:c.id,agentId:w.agentId,widgetId:w.id,status:'active',createdAt:now(),updatedAt:now(),messages:[]};
ws().convos.unshift(convo);save()}
function openPanel(){open=true;panel.classList.remove('hidden');
const l=host.querySelector('[data-action="w-open"]');if(l)l.classList.add('hidden');
if(!msgs.children.length)pushMsg('ai',w.welcome||((agentOf()&&agentOf().welcome)||'أهلًا 👋'));
ensureConvo();setTimeout(function(){if(input)input.focus()},50)}
function closePanel(){open=false;panel.classList.add('hidden');
const l=host.querySelector('[data-action="w-open"]');if(l)l.classList.remove('hidden')}
host.addEventListener('click',function(e){const b=e.target.closest('[data-action]');if(!b)return;
if(b.dataset.action==='w-open')openPanel();
if(b.dataset.action==='w-close')closePanel()});
if(form)form.addEventListener('submit',function(e){e.stopPropagation();e.preventDefault();
if(w.online===false){pushMsg('system',w.offline||'نحن غير متصلين حاليًا.');return}
if(convo&&convo.status==='handoff'){pushMsg('system','المحادثة بيد فريق الدعم الآن — الـ AI متوقف حتى يعيد الموظف تفعيله.');return}
const text=input.value.trim();if(!text)return;
if(text.length>500){pushMsg('system','الرسالة طويلة جدًا، اختصرها قليلًا.');return}
rl.push(now());rl=rl.filter(function(x){return now()-x<2e4});
if(rl.length>5){pushMsg('system','تمهل قليلًا 🙂 أرسلت رسائل كثيرة في وقت قصير.');return}
input.value='';pushMsg('visitor',text);
if(convo){convo.messages.push({from:'visitor',text:text,at:now()});convo.updatedAt=now();updateCustomerInsights(convo);save()}
typing(w.typing!==false);
getAIReply(text,agentOf(),w,convo).then(function(res){
typing(false);
if(res.system){pushMsg('system',res.text);if(convo){convo.messages.push({from:'system',text:res.text,at:now()})}}
else{
if(convo){convo.messages.push({from:'ai',text:res.text,at:now()});convo.updatedAt=now();
if(ws()){ws().usage.ai++;
if((ws().credits_balance||0)>0){ws().credits_balance--;ws().credit_history=ws().credit_history||[];ws().credit_history.unshift({type:'usage',amount:-1,description:'رد ذكي عبر الويدجت',created_at:new Date().toISOString()});}}
updateCustomerInsights(convo);}
pushMsg('ai',res.text);
if(w.sound)beep();
if(res.handoff)pushMsg('system','تم تحويل المحادثة إلى فريق الدعم ✋');}
save();});});
if(w.autoOpen&&w.online!==false)setTimeout(function(){if(!open)openPanel()},(w.delay||3)*1000);
return {openPanel:openPanel,closePanel:closePanel};}
/* ================= Router ================= */
function go(h){if(location.hash===h)route();else location.hash=h}
function route(){
const h=location.hash||'#/';
try{
if(h.indexOf('#/app')===0){if(!me()){toast('يجب تسجيل الدخول أولًا للوصول للوحة التحكم','err');go('#/login');return}renderDash(h)}
else if(h==='#/login')renderAuth('login');
else if(h==='#/signup')renderAuth('signup');
else if(h==='#/forgot')renderAuth('forgot');
else if(h.indexOf('#/setup')===0)renderSetup();
else if(h.indexOf('#/test')===0){if(!me()){toast('سجّل الدخول أولًا لفتح صفحة الاختبار','err');go('#/login');return}renderTest()}
else if(h.indexOf('#/onboarding')===0){if(!me()){toast('يجب تسجيل الدخول أولًا','err');go('#/login');return}renderOnboarding()}
else renderLanding();
}catch(err){console.error(err);const app=document.getElementById('app');if(app)app.innerHTML='<div class="p-20 text-center text-ink-400">حدث خطأ غير متوقع. <a class="text-tiffany-400 underline" href="#/">العودة للرئيسية</a></div>'}}
window.addEventListener('hashchange',route);
/* ================= Landing ================= */
function logoSVG(){return '<svg class="w-7 h-7 flex-none" viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="9" fill="#0ABAB5"/><path d="M16 8l2.2 5.8L24 16l-5.8 2.2L16 24l-2.2-5.8L8 16l5.8-2.2z" fill="#12151a"/></svg>'}
function brandHTML(){return logoSVG()+' إدارة <span class="text-tiffany-500">ســوشـــيــــال</span>'}
function renderLanding(){
const app=document.getElementById('app');
app.innerHTML=
'<div class="fixed inset-0 grid-bg pointer-events-none"></div>'
+'<header class="relative z-20 glass sticky top-0"><div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">'
+'<a href="#/" class="flex items-center gap-2 font-display font-extrabold text-lg">'+brandHTML()+'</a>'
+'<nav class="hidden md:flex items-center gap-6 text-sm text-ink-300"><a class="hover:text-white" href="#how">كيف يعمل</a><a class="hover:text-white" href="#features">المميزات</a><a class="hover:text-white" href="#usecases">حالات الاستخدام</a><a class="hover:text-white" href="#pricing">الأسعار</a><a class="hover:text-white" href="#faq">الأسئلة</a></nav>'
+'<div class="flex items-center gap-2">'+(me()?'<button data-action="go" data-to="#/app" class="btn-primary">لوحة التحكم</button>':'<button data-action="go" data-to="#/login" class="px-4 py-2 text-sm text-ink-200 hover:text-white">تسجيل الدخول</button><button data-action="go" data-to="#/signup" class="btn-primary">ابدأ مجانًا</button>')+'</div></div></header>'
+'<section class="relative z-10 max-w-7xl mx-auto px-4 pt-14 pb-20 grid lg:grid-cols-2 gap-12 items-center"><div class="fadeUp">'
+'<div class="inline-flex items-center gap-2 text-xs text-tiffany-300 bg-tiffany-500/10 border border-tiffany-500/30 rounded-full px-3 py-1.5 mb-5">'+icon('spark','w-4 h-4')+' إدارة ســوشـــيــــال — منصة موظفي الذكاء الاصطناعي للأعمال</div>'
+'<h1 class="font-display font-extrabold text-4xl md:text-5xl leading-[1.3] mb-5">أضف <span class="text-tiffany-400">موظف AI</span> إلى موقعك خلال دقائق</h1>'
+'<p class="text-ink-300 text-lg leading-8 mb-8">أنشئ وكلاء ذكاء اصطناعي مدرّبين على بيانات عملك فقط — بدون اختراع معلومات — خصّص ويدجت الدردشة، وانسخ سطرًا واحدًا من الكود إلى موقعك.</p>'
+'<div class="flex flex-wrap gap-3"><button data-action="go" data-to="'+(me()?'#/app':'#/signup')+'" class="btn-primary !text-base !px-7 !py-3.5">'+(me()?'افتح لوحة التحكم':'ابدأ مجانًا')+'</button><button data-action="scroll" data-to="#how" class="btn-ghost !text-base !px-7 !py-3.5">شاهد كيف يعمل</button></div>'
+'<div class="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-xs text-ink-400"><span class="flex items-center gap-1.5">'+icon('check','w-4 h-4 text-tiffany-500')+' Grounded AI — لا يخترع أسعارًا ولا منتجات</span><span class="flex items-center gap-1.5">'+icon('check','w-4 h-4 text-tiffany-500')+' معرفة معزولة لكل Agent</span><span class="flex items-center gap-1.5">'+icon('shield','w-4 h-4 text-tiffany-500')+' بدون اشتراك شهري — ادفع مقابل الردود فقط</span></div></div>'
+'<div class="relative fadeUp"><div class="glass rounded-2xl p-4 shadow-soft">'
+'<div class="flex items-center gap-1.5 pb-3 border-b border-ink-800 mb-3"><span class="w-2.5 h-2.5 rounded-full bg-red-400"></span><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span><span class="ltr text-[11px] text-ink-500 px-2 font-mono">your-store.com</span></div>'
+'<div class="relative h-[460px] rounded-xl bg-ink-900 overflow-hidden"><div class="p-5 space-y-3 opacity-60"><div class="h-4 w-2/5 bg-ink-800 rounded"></div><div class="h-3 w-4/5 bg-ink-850 rounded"></div><div class="h-3 w-3/5 bg-ink-850 rounded"></div><div class="grid grid-cols-3 gap-3 pt-2"><div class="h-20 bg-ink-850 rounded-lg"></div><div class="h-20 bg-ink-850 rounded-lg"></div><div class="h-20 bg-ink-850 rounded-lg"></div></div></div>'
+'<div id="hero-widget" class="absolute inset-0 pointer-events-none"><div class="pointer-events-auto absolute inset-0"></div></div></div></div>'
+'<div class="absolute -z-10 -top-10 -left-10 w-64 h-64 bg-tiffany-500/20 blur-3xl rounded-full"></div></div></section>'
+'<section id="how" class="relative z-10 max-w-7xl mx-auto px-4 py-20"><h2 class="sec-title">كيف يعمل؟</h2><p class="sec-sub">أربع خطوات من التسجيل إلى موظف AI يتحدث مع عملائك.</p><div class="grid md:grid-cols-4 gap-5 mt-10">'
+[['bot','أنشئ Agent','الاسم والتعليمات واللهجة والنموذج ونطاق الإجابة.'],['book','اربط المعرفة','موقعك الإلكتروني، ملفاتك، أو نصوص يدوية — معزولة لكل Agent.'],['widget','خصّص الويدجت','كل الألوان والأبعاد والسلوك مع معاينة حية فورية.'],['code','انسخ الكود','سطر واحد في أي موقع — والمحادثات تصل للوحة التحكم.']].map(function(s,i){return '<div class="glass rounded-2xl p-6 hover:border-tiffany-500/40 transition relative"><div class="absolute top-4 left-4 font-display font-extrabold text-ink-700 text-2xl">'+(i+1)+'</div><div class="w-11 h-11 rounded-xl bg-tiffany-500/10 text-tiffany-400 border border-tiffany-500/30 flex items-center justify-center mb-4">'+icon(s[0])+'</div><h3 class="font-display font-bold mb-2">'+s[1]+'</h3><p class="text-sm text-ink-400 leading-6">'+s[2]+'</p></div>'}).join('')+'</div></section>'
+'<section id="features" class="relative z-10 bg-ink-900/60 border-y border-ink-800 py-20"><div class="max-w-7xl mx-auto px-4"><h2 class="sec-title">مميزات بمستوى عالمي</h2><p class="sec-sub">كل ما تحتاجه لتشغيل موظفين رقميين على موقعك.</p><div class="grid md:grid-cols-3 gap-5 mt-10">'
+[['shield','Grounded AI','يجيب فقط من قاعدة معرفتك. إذا لم توجد المعلومة يقول ذلك بوضوح — لا يخترع أسعارًا ولا منتجات ولا مواعيد.'],['book','Knowledge Base حقيقية','زحف موقعك (حتى 10 صفحات)، رفع PDF/DOCX/CSV/Excel، نصوص يدوية — مع بديل يدوي عند فشل الزحف.'],['users','CRM تلقائي','تصنيف العملاء (مشتري/مهتم/محتمل)، Lead Score من 0 إلى 100، ووسوم تلقائية تتطور مع المحادثة.'],['bolt','Widget قابل للتخصيص كليًا','ألوان الرأس والخلفية والرسائل، الأبعاد، الظل، الإطار، رسالة عدم الاتصال — معاينة حية.'],['chat','محادثات حية + Handoff','كل رسالة تظهر فورًا في لوحة التحكم، وتحويل بشري يوقف الـ AI حتى يعيد الموظف تفعيله.'],['db','عمل متصل أو محلي','مزامنة كاملة مع الخادم عند توفره، ووضع محلي آمن عند انقطاع الاتصال.']].map(function(f){return '<div class="rounded-2xl p-6 bg-ink-850 border border-ink-800 hover:border-tiffany-500/40 hover:-translate-y-0.5 transition"><div class="w-10 h-10 rounded-lg bg-tiffany-500/10 text-tiffany-400 flex items-center justify-center mb-4">'+icon(f[0])+'</div><h3 class="font-display font-bold mb-1.5">'+f[1]+'</h3><p class="text-sm text-ink-400 leading-6">'+f[2]+'</p></div>'}).join('')+'</div></div></section>'
+'<section id="usecases" class="bg-ink-900/60 border-y border-ink-800 py-20"><div class="max-w-7xl mx-auto px-4"><h2 class="sec-title">لمن بُنيت إدارة ســوشـــيــــال؟</h2><p class="sec-sub">أي نشاط يريد الرد الفوري على عملائه — على مدار الساعة.</p><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">'
+['المتاجر الإلكترونية','الشركات','العيادات','المطاعم','الصالونات','العقارات','مكاتب الخدمات','مراكز التدريب'].map(function(u){return '<div class="rounded-xl bg-ink-850 border border-ink-800 p-5 text-center text-sm text-ink-200 hover:border-tiffany-500/40 hover:text-tiffany-300 transition">'+u+'</div>'}).join('')+'</div></div></section>'
+'<section id="pricing" class="max-w-7xl mx-auto px-4 py-20"><h2 class="sec-title">بدون اشتراك شهري — ادفع مقابل الردود فقط</h2><p class="sec-sub">اشترِ حزمة ردود مرة واحدة واستهلكها متى شئت. تبدأ بـ 20 ردًا مجانيًا.</p><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">'
+PKGS.map(function(p){return '<div class="rounded-2xl p-7 border relative '+(p.popular?'border-tiffany-500/60 bg-tiffany-500/5 shadow-glow':'border-ink-800 bg-ink-850')+'">'+(p.popular?'<span class="absolute -top-3 right-6 text-[11px] font-bold bg-tiffany-500 text-ink-950 rounded-full px-3 py-1">الأكثر شيوعًا</span>':'')+'<h3 class="font-display font-bold text-lg">'+p.name+'</h3><div class="my-4"><span class="font-display font-extrabold text-4xl">'+p.credits.toLocaleString()+'</span> <span class="text-ink-400 text-sm">رد</span></div><div class="text-2xl font-bold text-tiffany-400">$'+p.price+'</div><div class="text-[11px] text-ink-500 mt-1 mb-6">$'+(p.price/p.credits).toFixed(3)+' / رد</div><button data-action="go" data-to="#/signup" class="'+(p.popular?'btn-primary':'btn-ghost')+' w-full">ابدأ الآن</button></div>'}).join('')+'</div></section>'
+'<section id="faq" class="max-w-4xl mx-auto px-4 pb-20"><h2 class="sec-title">الأسئلة الشائعة</h2><div class="mt-8 space-y-3">'
+[['هل يخترع الـ AI معلومات غير موجودة؟','لا. يعمل بمبدأ Grounded AI الصارم: يجيب فقط من قاعدة معرفتك، وإذا لم يجد المعلومة يرد نصًا: «عذراً، هذه المعلومة غير متوفرة لدي حالياً، هل أستطيع تحويلك لأحد موظفي الدعم؟».'],['هل يوجد اشتراك شهري؟','لا. تشتري حزمة ردود مرة واحدة (مثلاً 1000 رد بـ 30 دولارًا) وتستهلكها متى شئت — بدون أي التزام شهري.'],['ماذا لو انقطع الاتصال بالخادم؟','يستمر التطبيق بالوضع المحلي تلقائيًا: بياناتك تُحفظ على جهازك وتعاد المزامنة بضغطة زر عند عودة الاتصال.'],['ماذا لو فشل زحف رابط موقعي؟','يفتح لك صندوقًا لتلصق محتوى الموقع يدويًا، فيُضاف فورًا كمصدر معرفة جاهز.'],['ماذا يحدث عندما يطلب العميل موظفًا؟','تتحول المحادثة إلى Human Handoff ويتوقف الـ AI عن الرد حتى يعيد الموظف تفعيله.'],['هل بياناتي معزولة؟','نعم، سياسات RLS على مستوى قاعدة البيانات تربط كل سجل بمساحة عملك فقط، ومعرفة كل Agent معزولة عن غيره.']].map(function(f){return '<details class="faq glass rounded-xl group"><summary class="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-sm list-none">'+f[0]+'<span class="text-tiffany-400 transition group-open:rotate-45 text-xl leading-none">+</span></summary><p class="px-5 pb-5 text-sm text-ink-400 leading-7">'+f[1]+'</p></details>'}).join('')+'</div></section>'
+'<section class="max-w-5xl mx-auto px-4 pb-24"><div class="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden border border-tiffany-500/30 bg-gradient-to-b from-tiffany-500/15 to-transparent"><h2 class="font-display font-extrabold text-3xl md:text-4xl mb-4">جاهز توظّف أول موظف AI لديك؟</h2><p class="text-ink-300 mb-8">انضم إلى إدارة ســوشـــيــــال الآن وأنشئ وكيلك الأول خلال دقائق — مع 20 ردًا مجانيًا للتجربة.</p><button data-action="go" data-to="#/signup" class="btn-primary !text-base !px-9 !py-4">ابدأ مجانًا الآن</button></div></section>'
+'<footer class="border-t border-ink-800 py-10 text-center text-sm text-ink-500"><div class="flex items-center justify-center gap-2 mb-3">'+brandHTML()+'</div>منصة إدارة ســوشـــيــــال لموظفي الذكاء الاصطناعي — كل الحقوق محفوظة '+new Date().getFullYear()+'</footer>';
var heroHost=document.querySelector('#hero-widget .pointer-events-auto');
if(heroHost){
var demoW=defWidget('','مساعد النخبة');
demoW.width=300;demoW.height=340;demoW.radius=14;demoW.avatar=AV_LOCAL[0];demoW.badge=true;
var heroAgent={name:'مساعد النخبة',welcome:'أهلًا بك في متجر النخبة 👋 اسألني عن الأسعار أو الشحن.',fallback:NO_INFO_MSG,avatar:AV_LOCAL[0]};
mountWidget(heroHost,demoW,heroAgent,{fixed:false,credit:false});}}
/* ================= Auth ================= */
function renderAuth(mode){
var titles={login:['مرحبًا بعودتك','سجّل دخولك لمتابعة إدارة موظفيك الرقميين.'],signup:['أنشئ حسابك','مساحة عمل معزولة جاهزة خلال ثوانٍ.'],forgot:['استعادة كلمة المرور','أدخل بريدك وسنرسل رابط إعادة التعيين.']};
var form='';
var demoBtn='<button type="button" data-action="demo-enter" class="btn-ghost w-full !py-3 !border-dashed text-ink-300">'+icon('eye','w-4 h-4')+' الدخول كضيف بدون حساب (وضع تجريبي — يبقى محفوظًا)</button>';
if(mode==='login')form='<form id="f-login" class="space-y-4"><label class="lbl">البريد الإلكتروني<input name="email" type="email" required class="inp" placeholder="you@company.com"></label><label class="lbl">كلمة المرور<input name="pass" type="password" required class="inp" placeholder="••••••••"></label><div class="flex items-center justify-between text-sm"><a href="#/forgot" class="text-tiffany-400 hover:underline">نسيت كلمة المرور؟</a></div><button class="btn-primary w-full !py-3" id="b-login">تسجيل الدخول</button><p class="text-sm text-ink-400 text-center">ليس لديك حساب؟ <a class="text-tiffany-400 font-semibold" href="#/signup">أنشئ حسابًا</a></p></form><div class="my-4 flex items-center gap-3 text-[11px] text-ink-600"><span class="flex-1 h-px bg-ink-800"></span>أو<span class="flex-1 h-px bg-ink-800"></span></div>'+demoBtn;
if(mode==='signup')form='<form id="f-signup" class="space-y-4"><label class="lbl">الاسم الكامل<input name="name" required class="inp" placeholder="اسمك"></label><label class="lbl">اسم النشاط / الشركة<input name="company" required class="inp" placeholder="مثال: متجر النخبة"></label><label class="lbl">نوع النشاط<select name="type" class="inp">'+['متجر إلكتروني','شركة','عيادة','مطعم','صالون','عقارات','مكتب خدمات','مركز تدريب','أخرى'].map(function(t){return '<option>'+t+'</option>'}).join('')+'</select></label><label class="lbl">البريد الإلكتروني<input name="email" type="email" required class="inp" placeholder="you@company.com"></label><label class="lbl">كلمة المرور<input name="pass" type="password" minlength="6" required class="inp" placeholder="6 أحرف على الأقل"></label><button class="btn-primary w-full !py-3" id="b-signup">إنشاء الحساب والبدء</button><p class="text-sm text-ink-400 text-center">لديك حساب؟ <a class="text-tiffany-400 font-semibold" href="#/login">سجّل دخولك</a></p></form><div class="my-4 flex items-center gap-3 text-[11px] text-ink-600"><span class="flex-1 h-px bg-ink-800"></span>أو<span class="flex-1 h-px bg-ink-800"></span></div>'+demoBtn;
if(mode==='forgot')form='<form id="f-forgot" class="space-y-4"><label class="lbl">البريد الإلكتروني<input name="email" type="email" required class="inp" placeholder="you@company.com"></label><button class="btn-primary w-full !py-3">إرسال رابط الاستعادة</button><p class="text-sm text-ink-400 text-center"><a class="text-tiffany-400" href="#/login">العودة لتسجيل الدخول</a></p></form>';
var modeBadge=isRemote()
?'<div class="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5 mb-6 w-fit">'+icon('db','w-3.5 h-3.5')+' متصل بقاعدة بيانات Supabase — جلستك ستبقى محفوظة</div>'
:'<div class="flex items-center gap-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1.5 mb-6 w-fit">'+icon('bolt','w-3.5 h-3.5')+' وضع محلي — الحسابات والبيانات تُحفظ على هذا الجهاز. <a href="#/setup" class="underline">اربط خادمًا حقيقيًا</a> للمزامنة</div>';
document.getElementById('app').innerHTML='<div class="min-h-screen grid lg:grid-cols-2">'
+'<div class="hidden lg:flex flex-col justify-between p-10 bg-ink-900 border-l border-ink-800 relative overflow-hidden"><div class="grid-bg absolute inset-0"></div>'
+'<a href="#/" class="relative flex items-center gap-2 font-display font-extrabold text-lg">'+brandHTML()+'</a>'
+'<div class="relative max-w-md"><h2 class="font-display font-extrabold text-3xl leading-snug mb-4">موظف AI لا ينام،<br><span class="text-tiffany-400">يرد على عملائك 24/7</span></h2><p class="text-ink-400 leading-7">Grounded AI + Knowledge Base معزولة لكل Agent + CRM تلقائي — يعمل متصلًا أو محليًا عند انقطاع الخادم.</p></div>'
+'<p class="relative text-xs text-ink-600">© إدارة ســوشـــيــــال</p></div>'
+'<div class="flex items-center justify-center p-6"><div class="w-full max-w-md fadeUp">'
+'<a href="#/" class="flex items-center gap-2 font-display font-extrabold text-lg mb-8 lg:hidden">'+brandHTML()+'</a>'
+'<h1 class="font-display font-extrabold text-2xl mb-1">'+titles[mode][0]+'</h1><p class="text-ink-400 text-sm mb-6">'+titles[mode][1]+'</p>'+modeBadge+form+'</div></div></div>';}
/* ================= Setup ================= */
var engTab='secrets';
var ENG_TABS=[['secrets','١. المفاتيح والنشر'],['sql2','٢. ترحيل قاعدة البيانات'],['sql3','٣. عمود agent_id'],['sql4','٤. العزل الصارم والتشخيص'],['ingest','kb-ingest'],['ai','ai-respond'],['verify','verify-widget'],['kbproc','kb-process'],['crawl','kb-crawl'],['widgetjs','widget.js'],['steps','خطوات النشر']];
var ENG_SRC={secrets:'src-secrets',sql2:'src-sql2',sql3:'src-sql3',sql4:'src-sql4',ingest:'src-ingest',ai:'src-ai',verify:'src-verify',kbproc:'src-kbproc',crawl:'src-crawl',widgetjs:'src-widgetjs'};
function engSource(k){var el=document.getElementById(ENG_SRC[k]);return el?el.textContent.trim():''}
var ENG_STEPS='<ol class="list-decimal pr-5 space-y-3 text-sm text-ink-300 leading-7"><li>شغّل ترحيل المرحلة 2 ثم «عمود agent_id» ثم «٤. العزل الصارم والتشخيص» في SQL Editor.</li><li>انشر الدوال الخمس (ai-respond، verify-widget، kb-process، kb-crawl، kb-ingest) بعد نسخها إلى مجلدات <span class="ltr">supabase/functions</span>.</li><li>ثبّت السر: <span class="ltr">supabase secrets set GEMINI_API_KEY=...</span></li><li>ارفع <span class="ltr">widget.js</span> على CDN واستبدل مصدر السكربت في كود التضمين.</li><li>جرّب من صفحة Knowledge Base: ملف + نص يدوي + رابط موقع — وتابع الحالات الحقيقية (رفع → معالجة → تضمينات → جاهز).</li><li>استعلم عن <span class="ltr">kb_diagnostics</span> من SQL Editor للتحقق من عدد المقاطع والتضمينات لكل مستند.</li></ol>';
function renderSetup(){
var connected=isRemote();
var phases=[['Supabase + قاعدة البيانات + RLS',true],['حفظ الودجات/الوكلاء مباشرة في Supabase',true],['widget.js + verify-widget + ai-respond (RAG)',true],['Knowledge Base: زحف + ملفات + نصوص + بديل يدوي',true],['عزل المعرفة لكل Agent + منع الإجابات العامة',true],['CRM: تصنيف + Lead Score + وسوم تلقائية',true],['معالج تهيئة (Onboarding) من 8 خطوات',true],['وضع محلي آمن عند انقطاع الخادم + إعادة مزامنة',true],['نظام رصيد الردود (بدون اشتراك شهري)',true]];
document.getElementById('app').innerHTML='<div class="min-h-screen max-w-4xl mx-auto px-4 py-10">'
+'<div class="flex items-center justify-between mb-8 flex-wrap gap-3"><a href="#/" class="flex items-center gap-2 font-display font-extrabold text-lg">'+brandHTML()+'</a><div class="flex gap-2">'+(me()?'<button data-action="go" data-to="#/app" class="btn-ghost !py-2 text-sm">لوحة التحكم</button>':'')+'<a href="#/" class="btn-ghost !py-2 text-sm">الرئيسية</a></div></div>'
+'<h1 class="font-display font-extrabold text-3xl mb-2">الخلفية والمحرك</h1>'
+'<p class="text-ink-400 text-sm leading-7 mb-8">كل الكود اللازم لتشغيل النظام مع عملاء حقيقيين: الترحيلات، الدوال، الويدجت، وخطوات النشر. بدون خادم يعمل التطبيق بالوضع المحلي الكامل.</p>'
+'<div class="grid md:grid-cols-[1fr_280px] gap-5 items-start"><div class="space-y-5">'
+'<div class="glass rounded-2xl p-6"><div class="flex items-center justify-between mb-4"><h3 class="font-display font-bold flex items-center gap-2">'+icon('db','w-5 h-5 text-tiffany-400')+' اتصال Supabase</h3>'+(connected?'<span class="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">● متصل</span>':'<span class="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1">● غير متصل (وضع محلي)</span>')+'</div>'
+'<form id="f-setup" class="space-y-3"><label class="lbl2">Supabase Project URL<input name="url" class="inp-s ltr" placeholder="https://xxxx.supabase.co" value="'+esc((cfg&&cfg.url)||'')+'" required></label><label class="lbl2">Anon Public Key<input name="key" class="inp-s ltr" placeholder="eyJhbGciOi..." value="'+esc((cfg&&cfg.key)||'')+'" required></label>'
+'<div class="flex gap-2 flex-wrap"><button class="btn-primary">حفظ وفحص الاتصال</button>'+(connected?'<button type="button" data-action="sb-disconnect" class="btn-ghost !border-red-500/40 !text-red-300">فصل الاتصال والعودة للوضع المحلي</button>':'')+'</div></form></div>'
+'<div class="glass rounded-2xl p-6"><div class="flex items-center justify-between mb-4 flex-wrap gap-2"><h3 class="font-display font-bold flex items-center gap-2">'+icon('bolt','w-5 h-5 text-tiffany-400')+' ملفات التنفيذ</h3><span class="text-[11px] text-tiffany-300 bg-tiffany-500/10 border border-tiffany-500/30 rounded-full px-3 py-1">جاهزة للنشر</span></div>'
+'<div class="flex flex-wrap gap-2 mb-4">'+ENG_TABS.map(function(t){return '<button data-action="eng-tab" data-id="'+t[0]+'" class="eng-tab '+(engTab===t[0]?'on':'')+'">'+t[1]+'</button>'}).join('')+'</div><div id="eng-view"></div></div></div>'
+'<div class="space-y-5"><div class="glass rounded-2xl p-6"><h3 class="font-display font-bold mb-4">مراحل الإطلاق</h3><div class="space-y-2.5">'+phases.map(function(p,i){return '<div class="flex items-center gap-2.5 text-sm"><span class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-none '+(p[1]?'bg-tiffany-500 text-ink-950 font-bold':'bg-ink-800 text-ink-500')+'">'+(i+1)+'</span><span class="'+(p[1]?'text-ink-100':'text-ink-500')+'">'+p[0]+'</span>'+(p[1]?'<span class="mr-auto text-tiffany-400 flex-none">'+icon('check','w-4 h-4')+'</span>':'')+'</div>'}).join('')+'</div></div>'
+'<div class="glass rounded-2xl p-6 text-xs text-ink-400 leading-6 space-y-2"><p><b class="text-ink-200">سلسلة الأمان (ملزمة في كل الدوال)</b></p><p>widget_id → موجود → التوكن يطابق data.token → مفعّل → الـ Agent المرتبط بالسجل نفسه → معرفة ذلك الـ Agent فقط.</p><p>لا يُقبل أي agent_id أو workspace_id من المتصفح إطلاقًا. لا تصل أي مفاتيح أسرار إلى الويدجت.</p></div></div></div>'
+'<div id="sb-status" class="mt-5"></div></div>';
fillEngView();}
function fillEngView(){
var v=document.getElementById('eng-view');if(!v)return;
if(engTab==='steps'){v.innerHTML='<div class="flex justify-end mb-2"><button data-action="copy-eng" class="btn-ghost !py-2 text-xs">'+icon('copy','w-3.5 h-3.5')+' نسخ الخطوات</button></div>'+ENG_STEPS;return}
v.innerHTML='<div class="flex justify-end mb-2"><button data-action="copy-eng" class="btn-ghost !py-2 text-xs">'+icon('copy','w-3.5 h-3.5')+' نسخ الملف</button></div><pre class="codebox" style="max-height:480px">'+esc(engSource(engTab))+'</pre>';}
/* ================= Test page ================= */
function renderTest(){
var s=ws();
var q=new URLSearchParams(location.hash.split('?')[1]||'');
var w=s?(s.widgets.find(function(x){return x.id===q.get('wid')})||s.widgets[0]):null;
if(!w){document.getElementById('app').innerHTML='<div class="p-20 text-center text-ink-400">لا يوجد ويدجت بعد. <a class="text-tiffany-400 underline" href="#/app/widgets">أنشئ ويدجت أولًا</a></div>';return}
var agent=s.agents.find(function(a){return a.id===w.agentId});
document.getElementById('app').innerHTML=
'<div class="fixed top-0 inset-x-0 z-50 bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs py-2 px-4 text-center">محاكاة موقع خارجي — هكذا يرى زوارك الويدجت <button data-action="go" data-to="#/app/widgets" class="underline mr-3 hover:text-white">العودة للوحة التحكم</button></div>'
+(!w.enabled?'<div class="fixed top-8 inset-x-0 z-50 bg-red-500/10 border-b border-red-500/30 text-red-300 text-xs py-2 px-4 text-center">هذا الويدجت معطل حاليًا من لوحة التحكم.</div>':'')
+'<div class="pt-16 bg-white text-slate-800 min-h-screen" dir="rtl"><div class="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between border-b border-slate-200"><b class="font-display text-slate-900">'+esc(s.settings.name||'موقع تجريبي')+'</b><div class="hidden md:flex gap-6 text-sm text-slate-500"><span>الرئيسية</span><span>المنتجات</span><span>تواصل معنا</span></div></div>'
+'<div class="max-w-5xl mx-auto px-4 py-14 text-center"><h1 class="font-display font-extrabold text-3xl text-slate-900 mb-3">مرحبًا بكم في '+esc(s.settings.name||'موقعنا')+'</h1><p class="text-slate-500 max-w-xl mx-auto">جرّب الويدجت الحي واسأل عن المعلومات المضافة في قاعدة المعرفة.</p>'
+'<div class="grid sm:grid-cols-3 gap-4 mt-10 text-right">'+[['خدمة العملاء','متوفرون دائمًا'],['المنتجات','حسب قاعدة المعرفة'],['الدعم','تحويل بشري عند الحاجة']].map(function(p){return '<div class="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm"><div class="h-28 rounded-xl bg-slate-100 mb-4"></div><b>'+p[0]+'</b><div class="text-tiffany-600 font-bold mt-1">'+p[1]+'</div></div>'}).join('')+'</div></div>'
+'<div class="max-w-5xl mx-auto px-4 pb-16 text-sm text-slate-500 leading-7">جرّب الـ Grounding: اسأل عن معلومة موجودة في قاعدة المعرفة ثم عن معلومة غير موجودة.</div></div><div id="test-widget"></div>';
var tw=document.getElementById('test-widget');
if(w.enabled&&tw)mountWidget(tw,w,agent,{fixed:true,persist:true,credit:true});}
/* ================= Onboarding ================= */
var OB_GOALS=[['🛠️','حل الشكاوى'],['❓','الرد على الأسئلة'],['🛒','توجيه العميل للشراء'],['✨','ترشيح المنتجات'],['📅','حجز المواعيد'],['📋','جمع بيانات العملاء'],['📍','توجيه العميل للجهة الصحيحة'],['📦','متابعة حالة الطلب'],['👤','التحويل لموظف بشري']];
function buildInstructions(goals, businessName) {
let instructions = 'أنت وكيل ذكاء اصطناعي لـ ' + businessName + ' عبر منصة إدارة ســوشـــيــــال. ';
if (goals.includes('حجز المواعيد')) instructions += 'اطلب من العميل الاسم والتاريخ المفضل للحجز. ';
if (goals.includes('الرد على الأسئلة')) instructions += 'أجب فقط من قاعدة المعرفة. لا تخترع معلومات. ';
if (goals.includes('توجيه العميل للشراء')) instructions += 'ساعد العميل في اختيار المنتج المناسب ووجّهه للشراء. ';
if (goals.includes('حل الشكاوى')) instructions += 'استمع للشكوى باهتمام وقدّم حلولاً من قاعدة المعرفة. ';
if (goals.includes('جمع بيانات العملاء')) instructions += 'اجمع اسم العميل وبريده ورقم هاتفه للمتابعة. ';
if (goals.includes('التحويل لموظف بشري')) instructions += 'إذا طلب العميل موظفاً بشرياً، حوّله بلباقة. ';
if (goals.includes('ترشيح المنتجات')) instructions += 'رشّح منتجات بناءً على احتياجات العميل من قاعدة المعرفة. ';
if (goals.includes('متابعة حالة الطلب')) instructions += 'اطلب رقم الطلب وتابع حالته من النظام. ';
if (goals.includes('توجيه العميل للجهة الصحيحة')) instructions += 'وجّه العميل للقسم أو الجهة المناسبة. ';
instructions += 'إذا لم تجد المعلومة في قاعدة المعرفة، قل نصًا: "' + NO_INFO_MSG + '"';
return instructions;}
function renderProgressBar(currentStep, totalSteps) {
totalSteps = totalSteps || 8;
var bars='';
for(var i=0;i<totalSteps;i++){
var isCompleted=i<currentStep, isCurrent=i===currentStep;
bars+='<div class="flex-1 h-[3px] rounded-full transition-all '+(isCompleted?'bg-tiffany-500':isCurrent?'bg-tiffany-500':'bg-ink-700 opacity-30')+'"></div>';}
return '<div class="flex gap-1.5 mb-8">'+bars+'</div>';}
function renderOnboardingPreview(step) {
const s = ws();
if(!s) return '';
const name = s.settings.name || 'نشاطك';
const goals = s.settings.goals || [];
const progress = Math.round((step / 8) * 100);
return '<div class="glass rounded-2xl p-5"><div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 rounded-xl bg-tiffany-500/10 text-tiffany-400 flex items-center justify-center">'+icon('bot','w-5 h-5')+'</div><div><div class="font-display font-bold text-sm">مساعد '+esc(name)+'</div><div class="text-[11px] text-ink-500">● نجهّز وكيلك...</div></div></div>'
+(goals.length?'<div class="mb-3"><div class="text-[11px] text-ink-500 mb-1.5">الأهداف</div><div class="flex flex-wrap gap-1">'+goals.map(function(g){return '<span class="text-[10px] bg-tiffany-500/10 text-tiffany-300 border border-tiffany-500/30 rounded-full px-2 py-0.5">'+esc(g)+'</span>'}).join('')+'</div></div>':'')
+'<div class="mb-3"><div class="text-[11px] text-ink-500 mb-1.5">القنوات</div><div class="flex flex-wrap gap-1"><span class="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full px-2 py-0.5">ويدجت الموقع ✓</span><span class="text-[10px] bg-ink-800 text-ink-500 border border-ink-700 rounded-full px-2 py-0.5">واتساب (قريباً)</span></div></div>'
+'<div class="glass rounded-xl p-3 bg-ink-850/50"><div class="flex items-center justify-between mb-1"><span class="text-[11px] text-ink-400">التقدم</span><span class="text-[11px] text-tiffany-300 font-bold">'+progress+'%</span></div><div class="h-1.5 bg-ink-800 rounded-full overflow-hidden"><div class="h-full bg-tiffany-500 rounded-full transition-all" style="width:'+progress+'%"></div></div></div>'
+(step>=6?'<div class="mt-3 text-[11px] text-ink-400 italic">"'+esc(name)+' يجهّز وكيله الذكي الأول عبر إدارة ســوشـــيــــال..."</div>':'')+'</div>';}
async function obBuildAgent(){
const s=ws();const st=s.settings;
if(st.obBuilt)return;
s.agents=s.agents.filter(function(a){return !a.__demo});
s.widgets=s.widgets.filter(function(w){return !w.__demo});
s.kb=s.kb.filter(function(k){return !k.__demo});
const name=st.name||'نشاطي';
const agent={id:uid('ag_'),name:name+' Assistant',desc:'وكيل ذكي لـ '+name+' أُنشئ عبر معالج التهيئة في إدارة ســوشـــيــــال.',avatar:AVT[0],
instructions:buildInstructions(st.goals||[],name),language:'العربية',tone:'ودي واحترافي',model:'gemini-2.5-flash-lite',
welcome:'أهلًا بك 👋 أنا مساعد '+name+'، اسألني وسأجيبك من معلوماتنا الموثقة فقط.',fallback:NO_INFO_MSG,createdAt:now()};
s.agents.push(agent);
s.kb.forEach(function(k){if(!k.agentId)k.agentId=agent.id});
const w=defWidget(agent.id,name+' Widget');
w.welcome='أهلًا بك 👋 أنا مساعد '+name+'، كيف أقدر أساعدك؟';
w.placeholder='اسأل وكيلك سؤالاً...';
s.widgets.push(w);
st.obBuilt=true;st.obAgentId=agent.id;st.obWidgetId=w.id;
st.onboardingAgentId=agent.id;st.onboardingWidgetId=w.id;
save();persist();
if(isRemote()){try{await sbUpsert('agents',agent);await syncWidgetToServer(w);}catch(e){toast('فشل الحفظ في قاعدة البيانات: '+e.message,'err')}}}
function obRunBuild(){
const st=ws().settings;
if(st.obBuilt)return;
const bar=document.getElementById('ob-build-bar');
const txt=document.getElementById('ob-build-txt');
let p=5;
const iv=setInterval(function(){p=Math.min(p+Math.random()*16,90);if(bar)bar.style.width=p+'%'},260);
obBuildAgent().then(function(){
clearInterval(iv);
if(bar)bar.style.width='100%';
if(txt)txt.innerHTML=icon('check','w-4 h-4 inline text-tiffany-400')+' تم بناء وكيلك الحقيقي';
const nb=document.getElementById('ob-next-btn');
if(nb){nb.disabled=false;nb.style.opacity='1';nb.classList.add('ob-next-active')}
toast('تم بناء وكيلك الحقيقي ✔','ok');
}).catch(function(err){
clearInterval(iv);
if(txt)txt.textContent='فشل البناء: '+(err.message||err);
toast('فشل البناء: '+(err.message||err),'err');});}
function obMountTest(){
const st=ws().settings;
const host=document.getElementById('ob-widget-host');
if(!host)return;
const w=ws().widgets.find(function(x){return x.id===(st.obWidgetId||st.onboardingWidgetId)});
const a=ws().agents.find(function(x){return x.id===(st.obAgentId||st.onboardingAgentId)});
if(!w||!a){host.innerHTML='<div class="p-8 text-center text-ink-500 text-sm">لم يتم العثور على الويدجت — عُد إلى خطوة البناء.</div>';return}
const inst=mountWidget(host,w,a,{fixed:false,persist:true,credit:true});
if(inst&&inst.openPanel)inst.openPanel();}
function renderOnboarding(){
const s=ws();
if(!s){go(me()?'#/app':'#/login');return}
const st=s.settings;
if(!st.goals)st.goals=[];
let step=st.onboardingStep||st.obStep||1;if(step<1)step=1;if(step>8)step=8;
st.onboardingStep=step;st.obStep=step;persist();
const name=st.name||'';
let title='',sub='',body='',nextOk=true,nextLabel='متابعة';
if(step===1){
title='أهلًا '+(name?esc(name):'بك')+' في إدارة ســوشـــيــــال، لنجهّز وكيلك';
sub='أكّد بيانات نشاطك — تُقرأ ديناميكيًا وتظهر في كل مكان تلقائيًا.';
nextOk=String(name).trim().length>0;
body='<div class="space-y-4"><label class="lbl2">اسم النشاط / الشركة *<input data-ob="name" class="inp" value="'+esc(name)+'" placeholder="مثال: متجر النخبة"></label>'
+'<label class="lbl2">نوع النشاط<select data-ob="type" class="inp">'+['متجر إلكتروني','شركة','عيادة','مطعم','صالون','عقارات','مكتب خدمات','مركز تدريب','أخرى'].map(function(t){return '<option '+(t===(st.type||'')?'selected':'')+'>'+t+'</option>'}).join('')+'</select></label></div>';}
else if(step===2){
title='ما الذي تريد أن يقوم به وكيلك؟';
sub='اختر هدفًا واحدًا على الأقل';
nextOk=st.goals.length>0;
body='<div class="grid sm:grid-cols-3 gap-3">'+OB_GOALS.map(function(g){
const sel=st.goals.indexOf(g[1])>-1;
return '<button type="button" data-action="ob-goal" data-id="'+esc(g[1])+'" class="glass rounded-xl p-4 text-right transition border '+(sel?'border-tiffany-500':'border-transparent hover:border-ink-600')+'" style="'+(sel?'background:rgba(10,186,181,0.1)':'')+'"><div class="text-xl mb-1">'+g[0]+'</div><div class="text-sm font-semibold">'+esc(g[1])+'</div>'+(sel?'<div class="text-[10px] text-tiffany-300 mt-1">'+icon('check','w-3 h-3 inline')+' محدد</div>':'')+'</button>'}).join('')+'</div>';}
else if(step===3){
title='وين بتنشر وكيلك؟';
sub='اختر القنوات اللي يستخدمها عملاؤك';
const soon=['واتساب','انستقرام','ماسنجر','إيميل','تيك توك','تيليجرام','هاتف'];
body='<div class="space-y-3">'
+'<div class="glass rounded-xl p-4 flex items-center justify-between border border-tiffany-500" style="background:rgba(10,186,181,0.1)"><div class="flex items-center gap-3"><span class="w-9 h-9 rounded-lg bg-tiffany-500/10 text-tiffany-400 flex items-center justify-center">'+icon('widget','w-4 h-4')+'</span><div><div class="text-sm font-bold">ويدجت الموقع</div><div class="text-[11px] text-ink-500">مفعّل وجاهز الآن</div></div></div><span class="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2.5 py-1">✓ مفعّل</span></div>'
+'<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">'+soon.map(function(c){return '<button type="button" data-action="soon-channel" data-id="'+c+'" class="glass rounded-xl p-3 text-center opacity-60 hover:opacity-90 transition cursor-pointer"><div class="text-xs font-semibold">'+c+'</div><div class="text-[9px] text-ink-500 mt-0.5">قريباً — اضغط للتفاصيل</div></button>'}).join('')+'</div>'
+'<div class="glass rounded-xl p-4 text-xs text-ink-300 flex items-center justify-between flex-wrap gap-2"><span>✨ باقة مجانية · 20 ردًا تجريبيًا · بدون اشتراك شهري</span><button data-action="go" data-to="#/app/billing" class="text-tiffany-400 hover:underline">شحن الرصيد</button></div></div>';}
else if(step===4){
title='خلي وكيلك يعرف منتجاتك';
sub='حط رابط صفحة وحدة ونقراها تلقائياً، أو ارفع ملف، أو اكتب بنفسك.';
const sources=s.kb.filter(function(k){return !k.__demo});
body='<div class="space-y-5">'
+'<div class="grid grid-cols-3 gap-3">'
+'<button type="button" data-action="kb-open" data-id="url" class="glass rounded-xl p-4 text-center hover:border-tiffany-500/50 transition border border-transparent"><div class="mb-1 text-tiffany-400 flex justify-center">'+icon('globe','w-6 h-6')+'</div><div class="text-sm font-bold">رابط موقع</div></button>'
+'<button type="button" data-action="kb-open" data-id="file" class="glass rounded-xl p-4 text-center hover:border-tiffany-500/50 transition border border-transparent"><div class="mb-1 text-tiffany-400 flex justify-center">'+icon('doc','w-6 h-6')+'</div><div class="text-sm font-bold">ملف</div></button>'
+'<button type="button" data-action="kb-open" data-id="text" class="glass rounded-xl p-4 text-center hover:border-tiffany-500/50 transition border border-transparent"><div class="mb-1 text-tiffany-400 flex justify-center">'+icon('edit','w-6 h-6')+'</div><div class="text-sm font-bold">نص يدوي</div></button></div>'
+'<div><div class="text-xs text-ink-500 mb-2">مصادرك الحالية ('+sources.length+') — ستُربط بوكيلك تلقائيًا في خطوة البناء:</div><div class="space-y-2">'
+(sources.map(function(k){
return '<div class="glass rounded-xl p-3 flex items-center gap-3"><span class="w-8 h-8 rounded-lg bg-tiffany-500/10 text-tiffany-400 flex items-center justify-center flex-none">'+icon(k.type==='url'?'globe':k.type==='file'?'doc':'edit','w-4 h-4')+'</span><div class="flex-1 min-w-0"><div class="text-xs font-semibold truncate">'+esc(k.name)+'</div><div class="text-[10px] text-ink-500">'+(k.chunkCount||0)+' مقطع'+(k.lastSync?' • آخر تحديث '+timeAgo(k.lastSync):'')+'</div></div>'+kbStatusBadge(k)+'</div>'}).join('')||'<div class="text-[11px] text-ink-600">لا مصادر بعد.</div>')+'</div></div></div>';}
else if(step===5){
title='هذا اللي تعلّمه وكيلك';
sub='';
const srcCount=s.kb.filter(function(k){return !k.__demo}).length;
const chunkTotal=s.kb.filter(function(k){return !k.__demo}).reduce(function(a,k){return a+(k.chunkCount||0)},0);
const tags=['وكلاء ذكاء حقيقيون','ربط قنوات حقيقي','بنية حقيقية للإنتاج','أمان الإنتاج','ويدجت موقع فعلي','تدفقات ذكية'];
body='<div class="space-y-5"><div class="flex items-center gap-3"><span class="w-12 h-12 rounded-full bg-tiffany-500/10 text-tiffany-400 flex items-center justify-center">'+icon('check','w-6 h-6')+'</span><div><div class="font-display font-bold">جاهز للبناء</div><div class="text-[11px] text-ink-500">'+srcCount+' مصدر معرفة • '+chunkTotal+' مقطع • '+st.goals.length+' هدف</div></div></div>'
+'<div class="flex flex-wrap gap-2">'+tags.map(function(t){return '<span class="text-[11px] bg-tiffany-500/10 text-tiffany-300 border border-tiffany-500/30 rounded-full px-3 py-1">'+t+'</span>'}).join('')+'</div>'
+'<button data-action="ob-goto" data-id="4" class="text-xs text-tiffany-400 hover:underline">أضف معلومات أكثر ←</button></div>';}
else if(step===6){
const urlDoc=s.kb.find(function(k){return k.type==='url'&&!k.__demo});
title='نجهّز وكيل تجربة لـ '+esc(name||'نشاطك');
sub='';
body='<div class="space-y-4"><div class="glass rounded-xl p-4 space-y-2 text-sm">'
+'<div class="flex items-center justify-between"><span class="text-ink-500 text-xs">اسم الوكيل</span><b>'+esc(name||'نشاطك')+' Assistant</b></div>'
+(urlDoc?'<div class="flex items-center justify-between"><span class="text-ink-500 text-xs">مصدر الموقع</span><span class="ltr text-xs text-tiffany-300">'+esc(urlDoc.name)+'</span></div>':'')
+'<div class="flex items-center justify-between"><span class="text-ink-500 text-xs">الأهداف</span><span class="text-xs">'+st.goals.length+' هدف</span></div></div>'
+'<div class="glass rounded-xl p-4"><div id="ob-build-txt" class="text-sm flex items-center gap-2 mb-3">'+(st.obBuilt?(icon('check','w-4 h-4 inline text-tiffany-400')+' تم بناء وكيلك الحقيقي'):'<span class="ob-spin"></span> نقرأ نشاطك...')+'</div>'
+'<div class="h-1.5 bg-ink-800 rounded-full overflow-hidden"><div id="ob-build-bar" class="h-full bg-tiffany-500 rounded-full transition-all" style="width:'+(st.obBuilt?'100':'5')+'%"></div></div></div>'
+(st.obBuilt?'':'<button data-action="ob-build" class="btn-ghost text-xs">إعادة محاولة البناء</button>')+'</div>';}
else if(step===7){
title='جرب وكيلك الحي';
sub='شات حي متصل فعليًا — يجيب من المعرفة الحقيقية التي أضفتها فقط.';
body='<div class="space-y-4"><div class="relative h-[540px] rounded-xl bg-ink-900 border border-ink-800 overflow-hidden grid-bg"><div id="ob-widget-host" class="absolute inset-0"></div></div>'
+'<div class="flex gap-2 flex-wrap"><button data-action="ob-next" class="btn-primary">وكيلي جاهز</button><button data-action="ob-test-page" class="btn-ghost">المعاينة</button><button data-action="ob-builder" class="btn-ghost">الإعداد</button></div></div>';}
else if(step===8){
title='رصيدك التجريبي جاهز 🎁';
sub='تبدأ بـ 20 ردًا مجانيًا — بدون أي اشتراك شهري. عندما تنتهي، اشترِ حزمة ردود من صفحة الرصيد.';
body='<div class="glass rounded-2xl p-6 mb-4 text-center border border-tiffany-500/40"><div class="text-4xl font-display font-extrabold text-tiffany-400 mb-1">20 رد مجاني</div><div class="text-xs text-ink-500">تُضاف تلقائيًا لحسابك عند إنهاء الإعداد</div></div>'
+'<div class="grid md:grid-cols-3 gap-3 mb-5">'+PKGS.slice(0,3).map(function(p){return '<div class="glass rounded-xl p-4 text-center '+(p.popular?'border border-tiffany-500/50':'')+'"><div class="font-bold text-sm mb-1">'+p.name+'</div><div class="text-2xl font-extrabold">'+p.credits.toLocaleString()+'</div><div class="text-[10px] text-ink-500 mb-2">رد</div><div class="text-tiffany-400 font-bold">$'+p.price+'</div></div>'}).join('')+'</div>'
+'<button data-action="ob-finish" class="btn-primary w-full !py-3.5 ob-next-active">إنهاء الإعداد والبدء</button>';}
document.getElementById('app').innerHTML='<div class="min-h-screen max-w-5xl mx-auto px-4 py-8">'
+'<div class="flex items-center justify-between mb-6 flex-wrap gap-3"><div class="flex items-center gap-2 font-display font-extrabold text-lg">'+logoSVG()+' معالج التهيئة</div>'
+'<div class="flex items-center gap-2">'+(step===1?'<button data-action="ob-skip" class="btn-ghost !py-2 text-xs">تخطي التهيئة</button>':'')+(step>1?'<button data-action="ob-back" class="btn-ghost !py-2 text-xs">رجوع</button>':'')+'</div></div>'
+renderProgressBar(step,8)
+'<div class="grid md:grid-cols-[1fr_280px] gap-5 items-start"><div class="glass rounded-2xl p-6 fadeUp">'
+'<h2 class="font-display font-extrabold text-2xl mb-1">'+title+'</h2>'
+(sub?'<p class="text-xs text-ink-500 mb-5">'+sub+'</p>':'<div class="mb-5"></div>')
+body
+(step<8?'<div class="mt-6 flex items-center justify-between">'+(step>1?'<button data-action="ob-back" class="btn-ghost">رجوع</button>':'<span></span>')+'<button id="ob-next-btn" data-action="ob-next" class="btn-primary '+(nextOk?'ob-next-active':'')+'" '+(nextOk?'':'disabled style="opacity:0.4;cursor:not-allowed"')+'>'+nextLabel+'</button></div>':'')
+'</div><div class="fadeUp">'+renderOnboardingPreview(step)+'</div></div></div>';
if(step===6&&!st.obBuilt)setTimeout(obRunBuild,400);
if(step===7)obMountTest();}
/* ================= Dashboard ================= */
var PAGES={'':'home',conversations:'convos',agents:'agents',widgets:'widgets',builder:'builder',contacts:'contacts',kb:'kb',analytics:'analytics',settings:'settings',billing:'billing'};
var NAV=[['','الرئيسية','home'],['conversations','المحادثات','chat'],['agents','AI Agents','bot'],['widgets','Widgets','widget'],['contacts','العملاء','users'],['kb','Knowledge Base','book'],['analytics','التحليلات','chart'],['settings','الإعدادات','gear'],['billing','الرصيد','card']];
function handoffCount(){var s=ws();return s?s.convos.filter(function(c){return c.status==='handoff'}).length:0}
function statusBadge(st){return st==='active'?'<span class="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full px-2 py-0.5 flex-none">نشطة</span>':st==='handoff'?'<span class="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full px-2 py-0.5 flex-none">تحويل بشري</span>':'<span class="text-[10px] bg-ink-800 text-ink-400 border border-ink-700 rounded-full px-2 py-0.5 flex-none">مغلقة</span>'}
function classBadge(c){
var m={'مشتري':'bg-tiffany-500/15 text-tiffany-300 border-tiffany-500/30','عميل محتمل':'bg-emerald-500/15 text-emerald-300 border-emerald-500/30','مهتم':'bg-sky-500/15 text-sky-300 border-sky-500/30','يحتاج متابعة':'bg-amber-500/15 text-amber-300 border-amber-500/30','عميل حالي':'bg-violet-500/15 text-violet-300 border-violet-500/30','غير مهتم':'bg-ink-800 text-ink-400 border-ink-700'};
var cls=m[c]||'bg-ink-800 text-ink-400 border-ink-700';
return '<span class="text-[10px] border rounded-full px-2 py-0.5 flex-none '+cls+'">'+esc(c||'استفسار عام')+'</span>';}
function dashShell(page,body,title){
var u=me(),s=ws();
var isDemo=!!(u&&u.demo);
var navBtns=NAV.map(function(n){
var active=(page===n[0])||(page==='builder'&&n[0]==='widgets');
return '<button data-action="go" data-to="#/app'+(n[0]?'/'+n[0]:'')+'" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition '+(active?'bg-tiffany-500/10 text-tiffany-300 border border-tiffany-500/30':'text-ink-300 hover:bg-ink-850 border border-transparent')+'">'+icon(n[2],'w-[18px] h-[18px]')+' '+n[1]+(n[0]==='conversations'&&handoffCount()?'<span class="mr-auto text-[10px] bg-amber-500 text-ink-950 font-bold rounded-full px-1.5 py-0.5">'+handoffCount()+'</span>':'')+'</button>'}).join('');
var connBtn='';
if(remoteBroken)connBtn='<button data-action="sync-now" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:border-amber-400">'+icon('refresh','w-4 h-4')+' المزامنة متوقفة — اضغط لإعادة الاتصال</button>';
else if(isRemote())connBtn='<button data-action="go" data-to="#/setup" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">'+icon('db','w-4 h-4')+' Supabase متصل — الجلسة محفوظة</button>';
else if(isDemo)connBtn='<button data-action="go" data-to="#/setup" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20">'+icon('eye','w-4 h-4')+' وضع تجريبي — محفوظ تلقائيًا</button>';
else connBtn='<button data-action="go" data-to="#/setup" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20">'+icon('db','w-4 h-4')+' وضع محلي — اربط الخلفية</button>';
document.getElementById('app').innerHTML='<div class="min-h-screen flex">'
+'<aside id="sidebar" class="fixed lg:sticky top-0 h-screen w-[250px] bg-ink-900 border-l border-ink-800 z-40 flex flex-col transition-transform lg:translate-x-0 max-lg:-translate-x-full flex-none">'
+'<div class="h-16 flex items-center gap-2 px-5 border-b border-ink-800 font-display font-extrabold flex-none text-sm">'+brandHTML()+'</div>'
+'<div class="px-5 py-3 text-[11px] text-ink-500 border-b border-ink-800 truncate flex-none">مساحة العمل: <b class="text-ink-300">'+esc(s.settings.name)+'</b></div>'
+'<nav class="flex-1 overflow-y-auto p-3 space-y-1">'+navBtns+'</nav>'
+'<div class="p-3 border-t border-ink-800 space-y-1 flex-none">'+connBtn
+'<button data-action="go" data-to="#/test" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-ink-300 hover:bg-ink-850">'+icon('globe','w-[18px] h-[18px]')+' موقع تجريبي</button>'
+'<button data-action="logout" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/10">'+icon('out','w-[18px] h-[18px]')+' '+(isDemo?'الخروج من الوضع التجريبي':'تسجيل الخروج')+'</button></div></aside>'
+'<div class="flex-1 min-w-0"><header class="h-16 sticky top-0 z-30 glass flex items-center justify-between px-4 md:px-8">'
+'<div class="flex items-center gap-3"><button data-action="sb" class="lg:hidden text-ink-300">'+icon('menu')+'</button><h1 class="font-display font-bold text-lg">'+title+'</h1>'+(isDemo?'<span class="hidden sm:inline-flex text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full px-2.5 py-1">وضع تجريبي — البيانات محلية لكنها محفوظة</span>':'')+'</div>'
+'<div class="flex items-center gap-3"><span class="hidden sm:flex items-center gap-2 text-xs text-ink-400 bg-ink-850 border border-ink-800 rounded-full px-3 py-1.5">'+icon('bolt','w-3.5 h-3.5 text-tiffany-400')+' '+(s.credits_balance!=null?s.credits_balance:0)+' رد متبقي</span><div class="w-9 h-9 rounded-full bg-tiffany-500/15 border border-tiffany-500/40 text-tiffany-300 flex items-center justify-center font-bold text-sm">'+esc(u.name.charAt(0))+'</div></div></header>'
+'<main class="p-4 md:p-8 max-w-[1200px]">'+body+'</main></div></div>'
+'<div id="sb-overlay" class="fixed inset-0 bg-black/60 z-30 hidden lg:hidden" data-action="sb"></div>';}
function statCard(ic,label,val,sub){return '<div class="glass rounded-2xl p-5"><div class="flex items-center justify-between mb-3"><span class="text-xs text-ink-400">'+label+'</span><span class="w-9 h-9 rounded-xl bg-tiffany-500/10 text-tiffany-400 flex items-center justify-center">'+icon(ic,'w-4 h-4')+'</span></div><div class="font-display font-extrabold text-2xl">'+val+'</div>'+(sub?'<div class="text-[11px] text-ink-500 mt-1">'+sub+'</div>':'')+'</div>'}
function renderDash(h){
var seg=(h.split('?')[0].match(/#\/app\/?([\w-]*)/)||[,''])[1];
var page=PAGES[seg]||'home';
if(page==='home'&&ws()&&ws().settings.onboarded!==true){go('#/onboarding');return}
var titles={home:'الرئيسية',convos:'المحادثات',agents:'AI Agents',widgets:'Widgets',builder:'Widget Builder',contacts:'العملاء',kb:'Knowledge Base',analytics:'التحليلات',settings:'الإعدادات',billing:'الرصيد والباقات'};
var body='';
if(page==='home')body=pgHome();
else if(page==='convos')body=pgConvos(h);
else if(page==='agents')body=pgAgents();
else if(page==='widgets')body=pgWidgets();
else if(page==='builder')body=pgBuilder(h);
else if(page==='contacts')body=pgContacts();
else if(page==='kb')body=pgKB();
else if(page==='analytics')body=pgAnalytics();
else if(page==='settings')body=pgSettings();
else if(page==='billing')body=pgBilling();
dashShell(page,body,titles[page]);
afterRender(page);}
function pgHome(){
var w=ws();var u=me();var isDemo=!!(u&&u.demo);
var today=w.convos.reduce(function(s,c){return s+c.messages.filter(function(m){return now()-m.at<DAY}).length},0);
var month=w.convos.reduce(function(s,c){return s+c.messages.filter(function(m){return now()-m.at<30*DAY}).length},0);
var cust=w.contacts||[];
var buyers=cust.filter(function(c){return c.class==='مشتري'}).length;
var prospects=cust.filter(function(c){return c.class==='عميل محتمل'}).length;
var interested=cust.filter(function(c){return c.class==='مهتم'}).length;
var avg=cust.length?Math.round(cust.reduce(function(s,c){return s+(c.leadScore||0)},0)/cust.length):0;
var conv=cust.length?Math.round(buyers/cust.length*100):0;
var days=[];for(var i=0;i<14;i++){var d0=new Date();d0.setHours(0,0,0,0);var from=d0.getTime()-(13-i)*DAY;
days.push(w.convos.reduce(function(s,c){return s+c.messages.filter(function(m){return m.at>=from&&m.at<from+DAY}).length},0))}
var max=Math.max.apply(null,days.concat([1]));
var recent=w.convos.slice(0,4).map(function(c){var ct=w.contacts.find(function(x){return x.id===c.contactId});
return '<button data-action="go" data-to="#/app/conversations?c='+c.id+'" class="w-full text-right flex items-center gap-3 hover:bg-ink-850 rounded-xl p-2 transition"><div class="w-9 h-9 rounded-full bg-ink-800 flex items-center justify-center text-xs font-bold text-tiffany-300 flex-none">'+esc(((ct&&ct.name)||'ز').charAt(0))+'</div><div class="flex-1 min-w-0"><div class="text-sm font-semibold truncate">'+esc((ct&&ct.name)||'زائر')+'</div><div class="text-[11px] text-ink-500 truncate">'+esc((c.messages[c.messages.length-1]||{}).text||'')+'</div></div>'+statusBadge(c.status)+'</button>'}).join('');
var banner='';
if(remoteBroken)banner='<div class="mb-4 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2 flex-wrap">'+icon('refresh','w-4 h-4')+' انقطع الاتصال بالخادم — التغييرات محفوظة محليًا. <button data-action="sync-now" class="underline font-bold">إعادة المزامنة الآن</button></div>';
else banner=isRemote()
?'<div class="mb-4 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">'+icon('db','w-4 h-4')+' البيانات محفوظة ومتزامنة مع Supabase — Workspace: <span class="ltr">'+esc((w.__wid||'').slice(0,8))+'…</span></div>'
:(isDemo?'<div class="mb-4 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2 flex-wrap">'+icon('eye','w-4 h-4')+' وضع تجريبي بدون حساب — بياناتك المحلية محفوظة وتبقى بعد إعادة الفتح. <a class="underline font-bold" href="#/signup">أنشئ حسابًا حقيقيًا</a></div>'
:'<div class="mb-4 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2 flex-wrap">'+icon('bolt','w-4 h-4')+' تعمل الآن على تخزين محلي آمن. <button data-action="go" data-to="#/setup" class="underline font-bold">اربط قاعدة بيانات Supabase →</button></div>');
return banner
+'<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">'+statCard('chat','المحادثات',w.convos.length,handoffCount()+' بانتظار تحويل بشري')+statCard('users','العملاء',cust.length,interested+' مهتم')+statCard('send','رسائل اليوم',today)+statCard('chart','رسائل الشهر',month)+statCard('bot','Agents',w.agents.length,'الحد في خطتك: '+PLANS[w.plan].agents)+statCard('widget','Widgets',w.widgets.length,w.widgets.filter(function(x){return x.enabled}).length+' نشط')+statCard('bolt','ردود متبقية',(w.credits_balance!=null?w.credits_balance:0),'من رصيدك المدفوع')+statCard('shield','المستهلك',(w.credits_used||0),'رد مستهلك')+'</div>'
+'<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">'+statCard('users','عملاء محتملون',prospects)+statCard('check','مشترون',buyers)+statCard('chart','معدل التحويل',conv+'%','مشترون ÷ إجمالي العملاء')+statCard('spark','متوسط Lead Score',avg,'من 0 إلى 100')+'</div>'
+'<div class="grid lg:grid-cols-3 gap-4 mt-4"><div class="lg:col-span-2 glass rounded-2xl p-6"><div class="flex items-center justify-between mb-5"><h3 class="font-display font-bold">نشاط الرسائل — 14 يومًا</h3><button data-action="go" data-to="#/app/analytics" class="text-xs text-tiffany-400 hover:underline">التحليلات الكاملة</button></div><div class="flex items-end gap-1.5 h-36">'+days.map(function(d){return '<div class="flex-1 rounded-t-md bar '+(d?'bg-tiffany-500/70':'bg-ink-800')+'" style="height:'+Math.max(d/max*100,4)+'%" title="'+d+'"></div>'}).join('')+'</div></div>'
+'<div class="glass rounded-2xl p-6"><h3 class="font-display font-bold mb-4">أحدث المحادثات</h3><div class="space-y-2">'+(recent||'<p class="text-sm text-ink-500">لا محادثات بعد — افتح «موقع تجريبي» وابدأ أول محادثة حقيقية.</p>')+'</div></div></div>';}
var selConvo=null;
function pgConvos(h){
var w=ws();
var q=new URLSearchParams(h.split('?')[1]||'');
if(q.get('c'))selConvo=q.get('c');
if(!selConvo&&w.convos.length)selConvo=w.convos[0].id;
var c=w.convos.find(function(x){return x.id===selConvo});
var list=w.convos.map(function(c2){var ct=w.contacts.find(function(x){return x.id===c2.contactId});
return '<button data-action="go" data-to="#/app/conversations?c='+c2.id+'" class="w-full text-right flex items-center gap-3 rounded-xl p-2.5 transition '+(c2.id===selConvo?'bg-tiffany-500/10 border border-tiffany-500/30':'hover:bg-ink-850 border border-transparent')+'"><div class="w-9 h-9 rounded-full bg-ink-800 flex items-center justify-center text-xs font-bold text-tiffany-300 flex-none">'+esc(((ct&&ct.name)||'ز').charAt(0))+'</div><div class="flex-1 min-w-0"><div class="flex items-center justify-between gap-2"><span class="text-sm font-semibold truncate">'+esc((ct&&ct.name)||'زائر')+'</span><span class="text-[10px] text-ink-500 flex-none">'+timeAgo(c2.updatedAt)+'</span></div><div class="flex items-center gap-2 mt-0.5"><span class="text-[11px] text-ink-500 truncate flex-1">'+esc((c2.messages[c2.messages.length-1]||{}).text||'—')+'</span>'+statusBadge(c2.status)+'</div></div></button>'}).join('');
var right='<div class="flex-1 flex items-center justify-center text-ink-500 text-sm">لا توجد محادثة محددة — افتح «موقع تجريبي» لإنشاء محادثة حقيقية</div>';
if(c){
var ct=w.contacts.find(function(x){return x.id===c.contactId});
var ag=w.agents.find(function(a){return a.id===c.agentId});
var wg=w.widgets.find(function(x){return x.id===c.widgetId});
var msgsHtml=c.messages.map(function(m){
if(m.from==='system')return '<div class="msg-in flex"><div class="text-[11px] text-amber-300 bg-amber-500/10 rounded-lg px-3 py-1.5 w-full text-center">'+esc(m.text)+'</div></div>';
var vis=m.from==='visitor';
return '<div class="msg-in flex '+(vis?'justify-start':'justify-end')+'"><div class="max-w-[75%] text-sm leading-6 px-3.5 py-2.5 '+(vis?'bg-ink-800 rounded-2xl rounded-tr-sm':'bg-tiffany-600 text-white rounded-2xl rounded-tl-sm')+'">'+md(m.text)+'<div class="text-[10px] opacity-60 mt-1">'+(m.from==='ai'?'AI ':m.from==='team'?'الفريق ':'')+' '+fmtTime(m.at)+'</div></div></div>'}).join('');
right='<div class="p-4 border-b border-ink-800 flex items-center justify-between gap-2 flex-wrap"><div><div class="flex items-center gap-2 flex-wrap"><b class="font-display">'+esc((ct&&ct.name)||'زائر')+'</b>'+(ct?classBadge(ct.class):'')+'</div><div class="text-[11px] text-ink-500 mt-0.5">'+esc((ag&&ag.name)||'')+' • '+esc((wg&&wg.name)||'')+' • '+fmtDate(c.createdAt)+((ct&&ct.phone)?' • <span class="ltr">'+esc(ct.phone)+'</span>':'')+((ct&&ct.email)?' • <span class="ltr">'+esc(ct.email)+'</span>':'')+'</div></div>'
+'<div class="flex items-center gap-2 flex-wrap">'+statusBadge(c.status)+(c.status!=='handoff'?'<button data-action="handoff" data-id="'+c.id+'" class="btn-ghost !py-1.5 !px-3 text-xs">تحويل بشري</button>':'<button data-action="ai-back" data-id="'+c.id+'" class="btn-ghost !py-1.5 !px-3 text-xs">إعادة تفعيل AI</button>')+(c.status!=='closed'?'<button data-action="close-convo" data-id="'+c.id+'" class="btn-ghost !py-1.5 !px-3 text-xs">إغلاق</button>':'<button data-action="reopen-convo" data-id="'+c.id+'" class="btn-ghost !py-1.5 !px-3 text-xs">إعادة فتح</button>')+'<button data-action="del-convo" data-id="'+c.id+'" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">'+icon('trash','w-4 h-4')+'</button></div></div>'
+(c.status==='handoff'?'<div class="bg-amber-500/10 text-amber-300 text-xs py-2 px-4 border-b border-amber-500/20">المحادثة بيد فريق بشري — الـ AI متوقف حتى يضغط الموظف «إعادة تفعيل AI».</div>':'')
+'<div id="dash-msgs" class="flex-1 overflow-y-auto p-4 space-y-2.5 chat-scroll">'+msgsHtml+'</div>'
+'<form id="f-dash-msg" class="p-3 border-t border-ink-800 flex gap-2"><input name="m" class="flex-1 bg-ink-850 border border-ink-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-tiffany-500 min-w-0" placeholder="رد يدوي كالفريق..." maxlength="500"><button class="btn-primary !px-4 flex-none">'+icon('send','w-4 h-4')+'</button></form>';}
return '<div class="grid lg:grid-cols-[320px_1fr] gap-4 lg:h-[calc(100vh-140px)]"><div class="glass rounded-2xl overflow-hidden flex flex-col max-h-[400px] lg:max-h-none"><div class="p-3 border-b border-ink-800"><div class="flex items-center gap-2 bg-ink-850 border border-ink-800 rounded-xl px-3 py-2">'+icon('search','w-4 h-4 text-ink-500')+'<input id="c-search" class="bg-transparent outline-none text-sm flex-1 min-w-0" placeholder="بحث بالاسم..."></div></div><div class="flex-1 overflow-y-auto p-2 space-y-1" id="c-list">'+(list||'<p class="text-sm text-ink-500 p-4">لا محادثات بعد — جرّب الموقع التجريبي.</p>')+'</div></div><div class="glass rounded-2xl flex flex-col min-h-[500px] lg:min-h-0">'+right+'</div></div>';}
function pgAgents(){
var w=ws();
var cards=w.agents.map(function(a){
var kbCount=w.kb.filter(function(k){return k.agentId===a.id}).length;
return '<div class="glass rounded-2xl p-6 hover:border-tiffany-500/40 transition"><div class="flex items-start gap-4"><img src="'+(a.avatar||AVT[0])+'" class="w-14 h-14 rounded-2xl object-cover border border-ink-700" alt="" onerror="this.style.display=\'none\'"><div class="flex-1 min-w-0"><h3 class="font-display font-bold">'+esc(a.name)+'</h3><p class="text-xs text-ink-500 mt-0.5">'+esc(a.model)+' • '+esc(a.tone)+'</p></div><button data-action="edit-agent" data-id="'+a.id+'" class="p-2 text-ink-400 hover:text-white hover:bg-ink-800 rounded-lg">'+icon('edit','w-4 h-4')+'</button><button data-action="del-agent" data-id="'+a.id+'" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">'+icon('trash','w-4 h-4')+'</button></div><p class="text-sm text-ink-400 leading-6 mt-3 line-clamp-2">'+esc(a.desc)+'</p><div class="flex items-center gap-2 mt-4 text-[11px] text-ink-500 flex-wrap"><span class="bg-ink-850 border border-ink-800 rounded-full px-2.5 py-1">'+esc(a.language)+'</span><span class="bg-ink-850 border border-ink-800 rounded-full px-2.5 py-1">'+kbCount+' مصدر معرفة</span><span class="bg-ink-850 border border-ink-800 rounded-full px-2.5 py-1">'+w.convos.filter(function(c){return c.agentId===a.id}).length+' محادثة</span><span class="bg-ink-850 border border-ink-800 rounded-full px-2.5 py-1">'+w.widgets.filter(function(x){return x.agentId===a.id}).length+' Widget</span></div></div>'}).join('');
return '<div class="flex items-center justify-between mb-5 flex-wrap gap-3"><p class="text-sm text-ink-400">'+w.agents.length+' من '+PLANS[w.plan].agents+' Agents في خطتك '+PLANS[w.plan].name+(isRemote()?' — الحد مفروض أيضًا من قاعدة البيانات':'')+'</p><button data-action="new-agent" class="btn-primary">'+icon('plus','w-4 h-4')+' Agent جديد</button></div><div class="grid md:grid-cols-2 gap-4">'+(cards||'<div class="md:col-span-2 glass rounded-2xl p-14 text-center text-ink-500">لا يوجد Agents بعد.<br><button data-action="new-agent" class="btn-primary mt-4">أنشئ أول Agent</button></div>')+'</div>';}
function pgWidgets(){
var w=ws();
var cards=w.widgets.map(function(x){var a=w.agents.find(function(g){return g.id===x.agentId});
return '<div class="glass rounded-2xl p-6"><div class="flex items-center gap-3 mb-4"><span class="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-none" style="background:'+(x.primary||'#0ABAB5')+'">'+icon('widget','w-5 h-5')+'</span><div class="flex-1 min-w-0"><b class="font-display">'+esc(x.name)+'</b><div class="text-[11px] text-ink-500">Agent: '+esc((a&&a.name)||'—')+'</div></div><button data-action="w-toggle" data-id="'+x.id+'" class="switch'+(x.enabled?' on':'')+'" title="تفعيل/تعطيل"></button></div>'
+'<div class="ltr bg-ink-950 border border-ink-800 rounded-xl p-3 font-mono text-[11px] text-ink-400 overflow-x-auto whitespace-nowrap mb-4">&lt;script src="https://cdn.aown.app/widget.js" data-widget-id="'+x.id+'" data-token="'+x.token+'" data-api="'+esc(apiBase()||'https://YOUR-PROJECT.supabase.co/functions/v1')+'" async&gt;&lt;/script&gt;</div>'
+'<div class="flex flex-wrap gap-2"><button data-action="open-builder" data-id="'+x.id+'" class="btn-ghost !py-2 text-xs">'+icon('edit','w-3.5 h-3.5')+' تخصيص ومعاينة</button><button data-action="embed" data-id="'+x.id+'" class="btn-ghost !py-2 text-xs">'+icon('code','w-3.5 h-3.5')+' كود التضمين</button><button data-action="go" data-to="#/test?wid='+x.id+'" class="btn-ghost !py-2 text-xs">'+icon('globe','w-3.5 h-3.5')+' اختبار حي</button><button data-action="del-widget" data-id="'+x.id+'" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg mr-auto">'+icon('trash','w-4 h-4')+'</button></div>'
+'<div class="text-[11px] mt-3 '+(x.enabled?'text-emerald-400':'text-red-400')+'">'+(x.enabled?'● نشط — يستقبل الرسائل':'● معطل — لن يظهر للزوار')+(isRemote()&&!x.__unsynced?' • محفوظ في قاعدة البيانات':'')+'</div>'
+(x.__unsynced?'<div class="mt-2 flex items-center justify-between gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-[11px] text-amber-300"><span>تعديلات غير متزامنة مع قاعدة البيانات — الويدجت المنشور لن يراها</span><button data-action="sync-widget" data-id="'+x.id+'" class="btn-ghost !py-1 !px-3 text-[11px] flex-none">مزامنة الآن</button></div>':'')+'</div>'}).join('');
return '<div class="flex items-center justify-between mb-5 flex-wrap gap-3"><p class="text-sm text-ink-400">كل Widget يُحفظ مباشرة في جدول <span class="ltr">widgets</span> في Supabase (id + data.token + data.agentId).</p><button data-action="new-widget" class="btn-primary">'+icon('plus','w-4 h-4')+' Widget جديد</button></div><div class="grid md:grid-cols-2 gap-4">'+(cards||'<div class="md:col-span-2 glass rounded-2xl p-14 text-center text-ink-500">لا Widgets بعد.</div>')+'</div>';}
var draft=null;
function pgBuilder(h){
var q=new URLSearchParams(h.split('?')[1]||'');
var id=q.get('id');
if(!draft||draft.id!==id){var src=ws().widgets.find(function(x){return x.id===id});draft=src?JSON.parse(JSON.stringify(src)):null}
if(!draft)return '<div class="glass rounded-2xl p-14 text-center text-ink-400">اختر Widget من <a class="text-tiffany-400 underline" href="#/app/widgets">قائمة الـ Widgets</a>.</div>';
var d=draft;
function row(label,inner){return '<div class="mb-4"><div class="text-xs text-ink-400 mb-1.5">'+label+'</div>'+inner+'</div>'}
var avBtns=AV_LOCAL.map(function(a){return '<button type="button" data-action="av" data-v="'+a+'" class="rounded-full overflow-hidden border-2 w-10 h-10 flex-none '+(d.avatar===a?'border-tiffany-500':'border-transparent')+'"><img src="'+a+'" class="w-full h-full object-cover"></button>'}).join('');
return '<div class="grid lg:grid-cols-[1fr_420px] gap-6 items-start"><div class="space-y-5">'
+'<div class="glass rounded-2xl p-6"><h3 class="font-display font-bold mb-4 text-tiffany-300">الألوان</h3><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">'
+row('Primary','<input type="color" data-b="primary" value="'+(d.primary||'#0ABAB5')+'">')+row('Secondary','<input type="color" data-b="secondary" value="'+(d.secondary||'#0b514f')+'">')+row('رأس الويدجت (اختياري)','<input type="color" data-b="header" value="'+(d.header||d.primary||'#0ABAB5')+'">')+row('خلفية اللوحة','<input type="color" data-b="bg" value="'+(d.bg||'#1a1e24')+'">')+row('رسالة الزائر','<input type="color" data-b="userBg" value="'+(d.userBg||'#22272f')+'">')+row('رسالة الـ AI','<input type="color" data-b="aiBg" value="'+(d.aiBg||d.primary||'#0ABAB5')+'">')+row('لون النص','<input type="color" data-b="text" value="'+(d.text||'#e8eaed')+'">')+'</div></div>'
+'<div class="glass rounded-2xl p-6"><h3 class="font-display font-bold mb-4 text-tiffany-300">الشكل والموقع</h3><div class="grid sm:grid-cols-2 gap-4">'
+row('موضع الويدجت','<select data-b="position" class="inp-s"><option value="bottom-left"'+(d.position==='bottom-left'?' selected':'')+'>أسفل اليسار</option><option value="bottom-right"'+(d.position==='bottom-right'?' selected':'')+'>أسفل اليمين</option></select>')
+row('استدارة الزوايا: <b class="v-radius">'+d.radius+'</b>px','<input type="range" min="0" max="28" data-b="radius" value="'+d.radius+'" class="w-full">')
+row('العرض: <b class="v-width">'+d.width+'</b>px','<input type="range" min="300" max="420" data-b="width" value="'+d.width+'" class="w-full">')
+row('الارتفاع: <b class="v-height">'+d.height+'</b>px','<input type="range" min="420" max="640" data-b="height" value="'+d.height+'" class="w-full">')
+row('حجم زر الفتح: <b class="v-buttonSize">'+(d.buttonSize||56)+'</b>px','<input type="range" min="44" max="68" data-b="buttonSize" value="'+(d.buttonSize||56)+'" class="w-full">')
+row('الظل','<button type="button" data-action="tg" data-b="shadow" class="switch'+(d.shadow!==false?' on':'')+'"></button>')
+row('إطار بلون الـ Primary','<button type="button" data-action="tg" data-b="border" class="switch'+(d.border?' on':'')+'"></button>')+'</div>'
+row('Avatar الويدجت','<div class="flex gap-2 items-center flex-wrap">'+avBtns+'<label class="btn-ghost !py-1.5 text-xs cursor-pointer">رفع صورة<input type="file" accept="image/*" id="w-avatar-file" class="hidden"></label></div>')
+row('شعار الشركة (Branding)','<div class="flex gap-2 items-center">'+(d.logo?'<img src="'+d.logo+'" class="w-10 h-10 rounded-lg object-cover border border-ink-700">':'')+'<label class="btn-ghost !py-1.5 text-xs cursor-pointer">رفع شعار<input type="file" accept="image/*" id="w-logo-file" class="hidden"></label>'+(d.logo?'<button type="button" data-action="rm-logo" class="text-xs text-red-400">إزالة</button>':'')+'</div>')+'</div>'
+'<div class="glass rounded-2xl p-6"><h3 class="font-display font-bold mb-4 text-tiffany-300">العنوان والرسائل</h3>'
+row('اسم المساعد','<input data-b="name" class="inp-s" value="'+esc(d.name||'')+'">')+row('رسالة الترحيب','<input data-b="welcome" class="inp-s" value="'+esc(d.welcome||'')+'" placeholder="اتركها فارغة لاستخدام ترحيب الـ Agent">')+row('Placeholder حقل الكتابة','<input data-b="placeholder" class="inp-s" value="'+esc(d.placeholder||'')+'">')+row('رسالة عدم الاتصال','<input data-b="offline" class="inp-s" value="'+esc(d.offline||'')+'">')
+'<div class="grid sm:grid-cols-2 gap-4">'+row('حالة «متصل الآن»','<button type="button" data-action="tg" data-b="online" class="switch'+(d.online?' on':'')+'"></button>')+row('مؤشر الكتابة Typing','<button type="button" data-action="tg" data-b="typing" class="switch'+(d.typing?' on':'')+'"></button>')+'</div></div>'
+'<div class="glass rounded-2xl p-6"><h3 class="font-display font-bold mb-4 text-tiffany-300">السلوك</h3><div class="grid sm:grid-cols-2 gap-4">'
+row('فتح تلقائي','<button type="button" data-action="tg" data-b="autoOpen" class="switch'+(d.autoOpen?' on':'')+'"></button>')+row('التأخير قبل الفتح (ثوانٍ)','<input type="number" min="1" max="30" data-b="delay" class="inp-s" value="'+(d.delay||3)+'">')+row('شارة إشعارات','<button type="button" data-action="tg" data-b="badge" class="switch'+(d.badge?' on':'')+'"></button>')+row('صوت عند الرد','<button type="button" data-action="tg" data-b="sound" class="switch'+(d.sound?' on':'')+'"></button>')+row('سلوك الجوال','<select data-b="mobile" class="inp-s"><option value="panel"'+(d.mobile==='panel'?' selected':'')+'>لوحة عائمة</option><option value="full"'+(d.mobile==='full'?' selected':'')+'>ملء الشاشة</option></select>')+'</div></div>'
+'<div class="flex gap-2 flex-wrap"><button data-action="save-widget" class="btn-primary">'+icon('check','w-4 h-4')+' حفظ التغييرات</button><button data-action="embed" data-id="'+d.id+'" class="btn-ghost">'+icon('code','w-4 h-4')+' كود التضمين</button><button data-action="go" data-to="#/test?wid='+d.id+'" class="btn-ghost">'+icon('globe','w-4 h-4')+' اختبار في موقع</button></div></div>'
+'<div class="lg:sticky top-24"><div class="text-xs text-ink-400 mb-2 flex items-center gap-2">'+icon('spark','w-4 h-4 text-tiffany-400')+' معاينة حية — كل تغيير يظهر فورًا بدون حفظ</div><div class="glass rounded-2xl p-4 bg-ink-900 relative h-[640px] overflow-hidden grid-bg"><div id="w-preview" class="absolute bottom-4" style="'+(d.position==='bottom-right'?'right:16px':'left:16px')+'"></div></div></div></div>';}
function renderPreview(){
var host=document.getElementById('w-preview');
if(!host||!draft)return;
var agent=ws().agents.find(function(a){return a.id===draft.agentId});
var dd=Object.assign({},draft,{width:Math.min(draft.width,356),height:Math.min(draft.height,560)});
host.innerHTML=widgetMarkup(dd,agent,{credit:false});
var msgs=host.querySelector('.w-msgs');
if(msgs)msgs.innerHTML='<div class="msg-in flex justify-end"><div class="max-w-[85%] text-sm leading-6 px-3.5 py-2.5 text-white rounded-2xl rounded-tl-sm" style="background:'+(draft.aiBg||draft.primary||'#0ABAB5')+'">'+md(draft.welcome||((agent&&agent.welcome)||'أهلًا 👋'))+'</div></div>'+(draft.typing!==false&&draft.online!==false?'<div class="typing flex gap-1 px-3 py-2 text-ink-500"><span></span><span></span><span></span></div>':'');
var cb=host.querySelector('[data-action="w-close"]');
if(cb)cb.addEventListener('click',function(e){e.stopPropagation();toast('هذه معاينة — زر الإغلاق يعمل في الويدجت المنشور','ok')});
['radius','width','height','buttonSize'].forEach(function(k){var el=host.parentElement.parentElement.querySelector('.v-'+k);if(el)el.textContent=draft[k]||''});}
function afterRender(page){
if(page==='builder')renderPreview();
if(page==='convos'){var m=document.getElementById('dash-msgs');if(m)m.scrollTop=m.scrollHeight;
var se=document.getElementById('c-search');
if(se)se.addEventListener('input',function(e){var v=norm(e.target.value);$$('#c-list button').forEach(function(b){b.style.display=norm(b.textContent).indexOf(v)>-1?'':'none'})})}}
function pgContacts(){
var w=ws();
var rows=w.contacts.map(function(c){
var tags=(c.tags||[]).map(function(t){return '<span class="text-[10px] bg-tiffany-500/10 text-tiffany-300 border border-tiffany-500/30 rounded-full px-2 py-0.5">'+esc(t)+'</span>'}).join('');
return '<tr class="border-b border-ink-850 hover:bg-ink-850/60"><td class="px-4 py-3"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-tiffany-500/10 text-tiffany-300 flex items-center justify-center font-bold flex-none">'+esc((c.name||'ز').charAt(0))+'</div><div><b>'+esc(c.name||'زائر')+'</b><div class="text-[11px] text-ink-500 ltr">'+esc(c.vid||'')+'</div></div></div></td><td class="px-4 py-3 text-ink-400 text-xs">'+(esc(c.email)||'—')+'<br>'+esc(c.phone||'')+'</td><td class="px-4 py-3">'+classBadge(c.class)+'</td><td class="px-4 py-3"><div class="flex items-center gap-2"><b class="text-sm">'+(c.leadScore||0)+'</b><div class="w-16 h-1.5 bg-ink-800 rounded-full overflow-hidden"><div class="h-full bg-tiffany-500" style="width:'+(c.leadScore||0)+'%"></div></div></div></td><td class="px-4 py-3 text-ink-400 text-xs">'+timeAgo(c.lastSeen||now())+'</td><td class="px-4 py-3">'+w.convos.filter(function(x){return x.contactId===c.id}).length+'</td><td class="px-4 py-3"><div class="flex flex-wrap gap-1 items-center max-w-[180px]">'+tags+'<button data-action="add-tag" data-id="'+c.id+'" class="text-[10px] text-ink-500 hover:text-tiffany-300">+ وسم</button></div></td><td class="px-4 py-3"><div class="flex gap-1"><button data-action="note" data-id="'+c.id+'" class="btn-ghost !py-1 !px-2.5 text-[11px]">ملاحظات</button><button data-action="del-contact" data-id="'+c.id+'" class="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg">'+icon('trash','w-3.5 h-3.5')+'</button></div></td></tr>'}).join('');
return '<div class="glass rounded-2xl overflow-x-auto"><table class="w-full text-sm min-w-[900px]"><thead class="text-ink-500 text-xs border-b border-ink-800"><tr>'+['العميل','التواصل','التصنيف','Lead Score','آخر نشاط','محادثات','وسوم',''].map(function(hh){return '<th class="text-right px-4 py-3 font-medium">'+hh+'</th>'}).join('')+'</tr></thead><tbody>'+(rows||'<tr><td colspan="8" class="p-10 text-center text-ink-500">لا عملاء بعد — يُنشأ العميل تلقائيًا مع أول محادثة من الويدجت.</td></tr>')+'</tbody></table></div>';}
function agentOptions(sel){return '<option value="">مشترك — كل الوكلاء (يُنسخ لكل وكيل)</option>'+ws().agents.map(function(a){return '<option value="'+a.id+'"'+(sel===a.id?' selected':'')+'>'+esc(a.name)+'</option>'}).join('')}
function kbStatusBadge(k){
var act=['pending','uploading','processing','embedding'];
if(act.indexOf(k.status)>-1)return '<span class="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full px-2 py-0.5 inline-flex items-center gap-1 flex-none"><span class="ob-spin"></span> '+(KB_STATUSES[k.status]||'جارٍ المعالجة')+'</span>';
if(k.status==='error')return '<span class="text-[10px] bg-red-500/15 text-red-300 border border-red-500/30 rounded-full px-2 py-0.5 flex-none" title="'+esc(k.error||'')+'">فشل</span>';
return '<span class="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full px-2 py-0.5 flex-none">'+(k.type==='url'?'متزامن':'جاهز')+'</span>';}
function kbDiagnostics(){
var docs=ws().kb;
var totalChunks=docs.reduce(function(a,k){return a+(k.chunkCount||0)},0);
var errs=docs.filter(function(k){return k.status==='error'});
var act=['pending','uploading','processing','embedding'];
return '<div class="glass rounded-2xl p-4 mb-4 text-xs text-ink-400 space-y-2">'
+'<div class="flex items-center justify-between flex-wrap gap-2"><b class="text-ink-200 text-sm">تشخيص قاعدة المعرفة</b><button data-action="kb-diag-log" class="btn-ghost !py-1 !px-3 text-[11px]">طباعة التفاصيل في console</button></div>'
+'<div class="flex flex-wrap gap-x-5 gap-y-1"><span>المستندات: <b class="text-ink-200">'+docs.length+'</b></span><span>جاهز: <b class="text-emerald-300">'+docs.filter(function(k){return k.status==='ready'}).length+'</b></span><span>قيد المعالجة: <b class="text-amber-300">'+docs.filter(function(k){return act.indexOf(k.status)>-1}).length+'</b></span><span>فشل: <b class="text-red-300">'+errs.length+'</b></span><span>إجمالي المقاطع: <b class="text-ink-200">'+totalChunks+'</b></span></div>'
+(errs.length?'<div class="text-red-300">'+errs.map(function(k){return '• '+esc(k.name)+': '+esc(k.error||'خطأ غير معروف')}).join('<br>')+'</div>':'')
+'<div class="text-[10px] text-ink-600">للتشخيص الكامل من جهة الخادم استعلم عن <span class="ltr">kb_diagnostics</span> في SQL Editor (تبويب «٤. العزل الصارم والتشخيص»).</div></div>';}
function kbTypeModal(){
modal('<h3 class="font-display font-bold text-lg mb-1">إضافة مصدر معرفة</h3><p class="text-xs text-ink-500 mb-4">اختر نوع المصدر — ستتم المعالجة الفعلية فور الإضافة (رفع → استخراج → تقسيم → تضمينات).</p>'
+'<div class="grid grid-cols-3 gap-3">'
+'<button type="button" data-action="kb-open" data-id="file" class="glass rounded-xl p-4 text-center hover:border-tiffany-500/50 transition border border-transparent"><div class="mb-1 text-tiffany-400 flex justify-center">'+icon('doc','w-6 h-6')+'</div><div class="text-sm font-bold">ملف</div><div class="text-[10px] text-ink-500 mt-1">PDF / DOCX / XLSX / CSV / TXT</div></button>'
+'<button type="button" data-action="kb-open" data-id="text" class="glass rounded-xl p-4 text-center hover:border-tiffany-500/50 transition border border-transparent"><div class="mb-1 text-tiffany-400 flex justify-center">'+icon('edit','w-6 h-6')+'</div><div class="text-sm font-bold">نص يدوي</div><div class="text-[10px] text-ink-500 mt-1">اكتب المعلومة بنفسك</div></button>'
+'<button type="button" data-action="kb-open" data-id="url" class="glass rounded-xl p-4 text-center hover:border-tiffany-500/50 transition border border-transparent"><div class="mb-1 text-tiffany-400 flex justify-center">'+icon('globe','w-6 h-6')+'</div><div class="text-sm font-bold">رابط موقع</div><div class="text-[10px] text-ink-500 mt-1">زحف حتى 10 صفحات</div></button></div>');}
function showFileInfo(file){
var info=document.getElementById('kb-fileinfo');if(!info)return;
info.classList.remove('hidden');
var n=document.getElementById('kb-filename');if(n)n.textContent=file.name;
var sz=document.getElementById('kb-filesize');if(sz)sz.textContent=fmtSize(file.size);}
function kbTypeModalOpen(type){
type=String(type||'').trim();
if(type!=='file'&&type!=='text'&&type!=='url'){toast('نوع مصدر غير معروف','err');return}
if(type==='file'){
modal('<h3 class="font-display font-bold mb-3">رفع ملف</h3><form id="f-kbm-file" class="space-y-3">'
+'<div id="kb-drop" class="rounded-xl border-2 border-dashed border-ink-600 hover:border-tiffany-500/60 transition p-6 text-center cursor-pointer"><div class="text-ink-400 text-sm">اسحب الملف هنا أو اضغط للاختيار</div><div class="text-[10px] text-ink-600 mt-1">PDF, DOCX, XLS, XLSX, CSV, TXT</div><input id="kb-filepick" type="file" accept=".pdf,.txt,.docx,.csv,.xlsx,.xls,.md" class="hidden"></div>'
+'<div id="kb-fileinfo" class="hidden glass rounded-xl p-3 flex items-center justify-between text-xs"><span id="kb-filename" class="font-semibold"></span><span id="kb-filesize" class="text-ink-500"></span></div>'
+'<label class="lbl2">الـ Agent المرتبط (عزل المعرفة)<select id="kbm-file-agent" class="inp-s">'+agentOptions('')+'</select></label>'
+'<div class="flex gap-2"><button class="btn-primary flex-1">رفع ومعالجة</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');
setTimeout(function(){
var drop=document.getElementById('kb-drop'),inp=document.getElementById('kb-filepick');
if(!drop||!inp)return;
drop.addEventListener('click',function(){inp.click()});
['dragover','dragenter'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('border-tiffany-500')})});
['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('border-tiffany-500');if(ev==='drop'&&e.dataTransfer&&e.dataTransfer.files[0]){inp.files=e.dataTransfer.files;showFileInfo(inp.files[0])}})});
inp.addEventListener('change',function(){if(inp.files[0])showFileInfo(inp.files[0])});
},50);
} else if(type==='text'){
modal('<h3 class="font-display font-bold mb-3">إضافة نص يدوي</h3><form id="f-kbm-text" class="space-y-3">'
+'<label class="lbl2">عنوان المعرفة (اختياري)<input name="title" class="inp-s" placeholder="مثال: أوقات العمل"></label>'
+'<label class="lbl2">النص *<textarea name="content" rows="6" required class="inp-s" placeholder="مثال: الدوام من السبت إلى الخميس، من الساعة 9 صباحًا حتى 6 مساءً."></textarea></label>'
+'<label class="lbl2">الـ Agent المرتبط (عزل المعرفة)<select id="kbm-text-agent" class="inp-s">'+agentOptions('')+'</select></label>'
+'<div class="flex gap-2"><button class="btn-primary flex-1">حفظ ومعالجة</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');
} else {
modal('<h3 class="font-display font-bold mb-3">إضافة رابط موقع</h3><form id="f-kbm-url" class="space-y-3">'
+'<label class="lbl2">رابط الموقع *<input name="url" type="url" required class="inp-s ltr" placeholder="https://example.com"></label>'
+'<div class="text-[10px] text-ink-500">يزحف حتى 10 صفحات ضمن نفس النطاق. إذا تعذرت القراءة الآلية سيفتح لك خيار لصق المحتوى يدويًا.</div>'
+'<label class="lbl2">الـ Agent المرتبط (عزل المعرفة)<select id="kbm-url-agent" class="inp-s">'+agentOptions('')+'</select></label>'
+'<div class="flex gap-2"><button class="btn-primary flex-1">إضافة ومزامنة</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');
}}
function pgKB(){
var w=ws();
var docs=w.kb.map(function(k){
var cnt=(k.chunkCount!=null)?k.chunkCount:((k.chunks&&k.chunks.length)||0);
var ag=k.agentId?w.agents.find(function(a){return a.id===k.agentId}):null;
var icn=k.type==='url'?'globe':k.type==='file'?'doc':'edit';
var typeLbl=k.type==='url'?'رابط موقع':k.type==='file'?'ملف':'نص يدوي';
var acts='';
if(k.type==='url')acts+='<button data-action="kb-reprocess" data-id="'+k.id+'" class="p-2 text-tiffany-300 hover:bg-tiffany-500/10 rounded-lg" title="إعادة الزحف">'+icon('refresh','w-4 h-4')+'</button>';
if(k.type==='file')acts+='<button data-action="kb-reprocess" data-id="'+k.id+'" class="p-2 text-tiffany-300 hover:bg-tiffany-500/10 rounded-lg" title="إعادة المعالجة">'+icon('refresh','w-4 h-4')+'</button>';
if(k.type==='text')acts+='<button data-action="kb-edit" data-id="'+k.id+'" class="p-2 text-ink-400 hover:text-white hover:bg-ink-800 rounded-lg" title="تعديل">'+icon('edit','w-4 h-4')+'</button>';
acts+='<button data-action="kb-del" data-id="'+k.id+'" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" title="حذف">'+icon('trash','w-4 h-4')+'</button>';
return '<div class="glass rounded-2xl p-5"><div class="flex items-start gap-4"><span class="w-11 h-11 rounded-xl bg-tiffany-500/10 text-tiffany-400 flex items-center justify-center flex-none">'+icon(icn,'w-5 h-5')+'</span>'
+'<div class="flex-1 min-w-0"><div class="flex items-center gap-2 flex-wrap"><b class="text-sm">'+esc(k.name)+'</b>'+kbStatusBadge(k)+'</div>'
+'<div class="text-[11px] text-ink-500 mt-1 flex flex-wrap gap-x-3 gap-y-1"><span>النوع: '+typeLbl+'</span><span>Agent: '+(ag?esc(ag.name):'مشترك (كل الوكلاء)')+'</span><span>'+cnt+' مقطع</span><span>أُضيف: '+fmtDate(k.createdAt)+'</span>'+(k.lastSync?'<span>آخر مزامنة: '+timeAgo(k.lastSync)+'</span>':'')+(k.size?'<span>الحجم: '+fmtSize(k.size)+'</span>':'')+'</div>'
+'<p class="text-xs text-ink-400 mt-2 leading-6 line-clamp-2">'+esc(k.content||'')+'</p>'
+(k.status==='error'?'<div class="text-[11px] text-red-300 mt-1">سبب الفشل: '+esc(k.error||'خطأ غير معروف')+' <button data-action="kb-reprocess" data-id="'+k.id+'" class="text-tiffany-300 underline mr-1">إعادة المحاولة</button></div>':'')
+'</div><div class="flex gap-1 flex-none">'+acts+'</div></div></div>'}).join('');
return '<div class="flex items-center justify-between mb-5 flex-wrap gap-3"><div><h2 class="font-display font-bold text-xl">مصادر المعرفة</h2><p class="text-xs text-ink-500 mt-1">كل مصدر معزول حسب الـ Agent — لا تداخل بين الوكلاء. الحالة لا تصبح «جاهز» إلا بعد نجاح المعالجة فعليًا.</p></div><button data-action="kb-add" class="btn-primary">'+icon('plus','w-4 h-4')+' إضافة مصدر</button></div>'
+kbDiagnostics()
+'<div class="space-y-3">'+(docs||'<div class="glass rounded-2xl p-12 text-center text-ink-500">لا مصادر بعد — <button data-action="kb-add" class="text-tiffany-400 underline">أضف مصدرًا الآن</button>: رابط موقعك، ملف، أو نص يدوي.</div>')+'</div>';}
function pgAnalytics(){
var w=ws();var total=w.convos.length||1;
var closed=w.convos.filter(function(c){return c.status==='closed'}).length;
var hand=w.convos.filter(function(c){return c.status==='handoff'}).length;
var act=Math.max(total-closed-hand,0);
var days=[];for(var i=0;i<14;i++){var d0=new Date();d0.setHours(0,0,0,0);var from=d0.getTime()-(13-i)*DAY;
days.push({d:from,v:w.convos.reduce(function(s,c){return s+c.messages.filter(function(m){return m.at>=from&&m.at<from+DAY}).length},0)})}
var max=Math.max.apply(null,days.map(function(x){return x.v}).concat([1]));
var firsts={};w.convos.forEach(function(c){var t=(c.messages[0]||{}).text||'';tokens(t).slice(0,3).forEach(function(tk){firsts[tk]=(firsts[tk]||0)+1})});
var top=Object.entries(firsts).sort(function(a,b){return b[1]-a[1]}).slice(0,5);
var C=2*Math.PI*40,off=0;
var segs=[['#0ABAB5',act],['#f59e0b',hand],['#414a56',closed]].map(function(p){var len=p[1]/total*C;var s='<circle cx="50" cy="50" r="40" fill="none" stroke="'+p[0]+'" stroke-width="14" stroke-dasharray="'+len+' '+(C-len)+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 50 50)"/>';off+=len;return s}).join('');
var cust=w.contacts||[];
var clsCounts=CLASSES.map(function(cl){return {cl:cl,n:cust.filter(function(c){return c.class===cl}).length}}).filter(function(x){return x.n>0});
var clsMax=Math.max.apply(null,clsCounts.map(function(x){return x.n}).concat([1]));
return '<div class="grid lg:grid-cols-3 gap-4"><div class="lg:col-span-2 glass rounded-2xl p-6"><h3 class="font-display font-bold mb-5">الرسائل يوميًا</h3><div class="flex items-end gap-1.5 h-44">'+days.map(function(x){return '<div class="flex-1 flex flex-col items-center gap-1.5"><div class="w-full rounded-t-md bar bg-tiffany-500/70" style="height:'+Math.max(x.v/max*100,3)+'%"></div><span class="text-[9px] text-ink-600">'+fmtDate(x.d)+'</span></div>'}).join('')+'</div></div>'
+'<div class="glass rounded-2xl p-6"><h3 class="font-display font-bold mb-4">حالات المحادثات</h3><div class="flex items-center gap-5"><svg viewBox="0 0 100 100" class="w-28 h-28 flex-none">'+segs+'</svg><div class="space-y-2 text-xs"><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-tiffany-500"></span>نشطة: <b>'+act+'</b></div><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-500"></span>تحويل بشري: <b>'+hand+'</b></div><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-ink-700"></span>مغلقة: <b>'+closed+'</b></div></div></div></div>'
+'<div class="lg:col-span-2 glass rounded-2xl p-6"><h3 class="font-display font-bold mb-4">توزيع تصنيفات العملاء</h3><div class="space-y-2">'+(clsCounts.map(function(x){return '<div class="flex items-center gap-3"><span class="text-xs text-ink-400 w-24 flex-none">'+esc(x.cl)+'</span><div class="flex-1 h-6 bg-ink-850 rounded-lg overflow-hidden"><div class="h-full bg-tiffany-500/25 border-l border-tiffany-500/50 flex items-center px-3 text-xs" style="width:'+Math.max(x.n/clsMax*100,10)+'%">'+x.n+'</div></div></div>'}).join('')||'<p class="text-sm text-ink-500">لا بيانات بعد — ستظهر التصنيفات تلقائيًا مع أول محادثات حقيقية.</p>')+'</div></div>'
+'<div class="glass rounded-2xl p-6"><h3 class="font-display font-bold mb-4">أكثر المواضيع ورودًا</h3><div class="space-y-2">'+(top.map(function(t,i){return '<div class="flex items-center gap-3"><span class="text-xs text-ink-500 w-4">'+(i+1)+'</span><div class="flex-1 h-7 bg-ink-850 rounded-lg overflow-hidden"><div class="h-full bg-tiffany-500/25 border-l border-tiffany-500/50 rounded-lg flex items-center px-3 text-xs" style="width:'+Math.max(t[1]/top[0][1]*100,15)+'%">'+esc(t[0])+' — '+t[1]+'</div></div></div>'}).join('')||'<p class="text-sm text-ink-500">لا بيانات كافية.</p>')+'</div></div></div>';}
function pgSettings(){
var s=ws().settings;
var teamRows=(s.team||[]).map(function(t,idx){return '<div class="flex items-center justify-between bg-ink-850 border border-ink-800 rounded-xl px-4 py-2.5 text-sm"><span class="ltr">'+esc(t.email)+'</span><span class="flex items-center gap-2"><span class="text-[10px] text-tiffany-300 bg-tiffany-500/10 rounded-full px-2 py-0.5">'+esc(t.role)+'</span><button data-action="del-member" data-id="'+idx+'" class="text-red-400 hover:bg-red-500/10 rounded-lg p-1">'+icon('trash','w-3.5 h-3.5')+'</button></span></div>'}).join('');
return '<div class="grid lg:grid-cols-2 gap-5 items-start"><div class="glass rounded-2xl p-6 space-y-4"><h3 class="font-display font-bold">ملف مساحة العمل</h3><label class="lbl2">اسم النشاط<input id="s-name" class="inp-s" value="'+esc(s.name)+'"></label><label class="lbl2">نوع النشاط<select id="s-type" class="inp-s">'+['متجر إلكتروني','شركة','عيادة','مطعم','صالون','عقارات','مكتب خدمات','مركز تدريب','أخرى'].map(function(t){return '<option '+(t===s.type?'selected':'')+'>'+t+'</option>'}).join('')+'</select></label><label class="lbl2">اللغة الافتراضية<select id="s-lang" class="inp-s">'+['العربية','English'].map(function(t){return '<option '+(t===s.lang?'selected':'')+'>'+t+'</option>'}).join('')+'</select></label><label class="lbl2">المنطقة الزمنية<select id="s-tz" class="inp-s">'+['Asia/Riyadh','Asia/Dubai','Asia/Kuwait','Africa/Cairo'].map(function(t){return '<option '+(t===s.tz?'selected':'')+'>'+t+'</option>'}).join('')+'</select></label><button data-action="save-settings" class="btn-primary">حفظ الإعدادات</button></div>'
+'<div class="space-y-5"><div class="glass rounded-2xl p-6"><h3 class="font-display font-bold mb-4">الفريق</h3><div class="space-y-2 mb-4">'+(teamRows||'<p class="text-xs text-ink-500">لا أعضاء بعد.</p>')+'</div><form id="f-team" class="flex gap-2"><input name="email" type="email" required class="inp-s ltr" placeholder="teammate@company.com"><button class="btn-ghost !px-4 flex-none">'+icon('plus','w-4 h-4')+'</button></form></div>'
+'<div class="glass rounded-2xl p-6 border-red-500/20"><h3 class="font-display font-bold mb-2 text-red-300">منطقة الخطر</h3><p class="text-xs text-ink-500 mb-4">إجراءات لا يمكن التراجع عنها.</p><div class="flex gap-2 flex-wrap"><button data-action="reset-ws" class="btn-ghost !border-red-500/40 !text-red-300">إعادة تعيين البيانات</button><button data-action="del-account" class="btn-ghost !border-red-500/40 !text-red-300">حذف الحساب</button></div></div></div></div>';}
/* صفحة الرصيد — نظام حزم الردود (بدون اشتراك شهري) */
function pgBilling(){
var w=ws();
var credits=w.credits_balance!=null?w.credits_balance:0;
var used=w.credits_used||0;
var hist=w.credit_history||[];
return '<div class="space-y-6">'
+'<div class="glass rounded-2xl p-6"><div class="flex items-center justify-between mb-4"><h3 class="font-display font-bold text-xl">رصيدك الحالي</h3><span class="text-3xl font-display font-extrabold text-tiffany-400">'+credits.toLocaleString()+' رد</span></div>'
+'<div class="grid grid-cols-2 gap-4 text-sm"><div class="bg-ink-850 rounded-xl p-3"><div class="text-ink-400 text-xs mb-1">مستهلك</div><div class="font-bold text-lg">'+used.toLocaleString()+' رد</div></div>'
+'<div class="bg-ink-850 rounded-xl p-3"><div class="text-ink-400 text-xs mb-1">متاح</div><div class="font-bold text-lg text-emerald-400">'+credits.toLocaleString()+' رد</div></div></div>'
+'<p class="text-[11px] text-ink-500 mt-3">بدون اشتراك شهري — تشتري الردود مرة واحدة وتستهلكها متى شئت. يُخصم رد واحد عن كل رد ذكي يُرسل للعميل.</p></div>'
+'<div><h3 class="font-display font-bold text-xl mb-4">اشترِ حزمة ردود</h3><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">'
+PKGS.map(function(p){return '<div class="glass rounded-2xl p-6 border-2 '+(p.popular?'border-tiffany-500':'border-transparent')+' hover:border-tiffany-500/50 transition relative">'
+(p.popular?'<div class="absolute -top-3 right-5 text-[10px] bg-tiffany-500 text-ink-950 font-bold px-3 py-1 rounded-full">الأكثر شيوعًا</div>':'')
+'<h4 class="font-display font-bold text-lg mb-2">'+p.name+'</h4>'
+'<div class="text-3xl font-display font-extrabold mb-1">'+p.credits.toLocaleString()+'</div><div class="text-ink-400 text-xs mb-4">رد متاح</div>'
+'<div class="text-2xl font-bold text-tiffany-400 mb-1">$'+p.price+'</div><div class="text-[10px] text-ink-500 mb-4">$'+(p.price/p.credits).toFixed(3)+' / رد</div>'
+'<button data-action="buy-package" data-id="'+p.id+'" class="btn-primary w-full">شراء الآن</button></div>'}).join('')
+'</div></div>'
+'<div class="glass rounded-2xl p-6"><h3 class="font-display font-bold text-lg mb-4">سجل المعاملات</h3><div class="space-y-2 text-sm">'
+(hist.slice(0,10).map(function(tx){return '<div class="flex items-center justify-between p-3 bg-ink-850 rounded-xl"><div><div class="font-semibold">'+esc(tx.description)+'</div><div class="text-[10px] text-ink-500">'+new Date(tx.created_at).toLocaleString('ar')+'</div></div>'
+'<div class="'+(tx.amount>0?'text-emerald-400':'text-red-400')+' font-bold">'+(tx.amount>0?'+':'')+tx.amount.toLocaleString()+' رد</div></div>'}).join('')||'<div class="text-ink-500 text-center py-4">لا توجد معاملات بعد</div>')
+'</div></div></div>';}
/* ---- Modals ---- */
function modal(html){document.getElementById('modal-root').innerHTML='<div class="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4" data-action="modal-close"><div class="glass rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto p-6 fadeUp shadow-soft">'+html+'</div></div>'}
function closeModal(){document.getElementById('modal-root').innerHTML=''}
function agentModal(id){
var a=id?ws().agents.find(function(x){return x.id===id}):null;
var v=a||{name:'',desc:'',avatar:AVT[0],instructions:'',language:'العربية',tone:'ودي واحترافي',model:'gemini-2.5-flash-lite',welcome:'أهلًا بك 👋 كيف أقدر أساعدك؟',fallback:NO_INFO_MSG};
var avs=AV_LOCAL.map(function(u){return '<label class="cursor-pointer"><input type="radio" name="avatar" value="'+u+'" class="hidden peer" '+(v.avatar===u?'checked':'')+'><img src="'+u+'" class="w-12 h-12 rounded-xl object-cover border-2 peer-checked:border-tiffany-500 border-transparent"></label>'}).join('');
modal('<h3 class="font-display font-bold text-lg mb-5">'+(a?'تعديل':'إنشاء')+' Agent</h3><form id="f-agent" class="space-y-3"><input type="hidden" name="id" value="'+((a&&a.id)||'')+'"><label class="lbl2">اسم الـ Agent *<input name="name" required class="inp-s" value="'+esc(v.name)+'" placeholder="مثال: موظف المبيعات"></label><label class="lbl2">الوصف (شخصية المساعد)<input name="desc" class="inp-s" value="'+esc(v.desc)+'"></label><div class="text-xs text-ink-400 mb-1">Avatar</div><div class="flex gap-2 mb-1">'+avs+'</div><label class="lbl2">التعليمات: أسلوب الكلام، اللهجة، قواعد الإجابة، الممنوعات *<textarea name="instructions" required rows="4" class="inp-s" placeholder="أنت موظف مبيعات لمتجر...">'+esc(v.instructions)+'</textarea></label><div class="grid grid-cols-2 gap-3"><label class="lbl2">اللغة<select name="language" class="inp-s">'+['العربية','English','ثنائي اللغة'].map(function(l){return '<option '+(l===v.language?'selected':'')+'>'+l+'</option>'}).join('')+'</select></label><label class="lbl2">النبرة واللهجة<select name="tone" class="inp-s">'+['ودي واحترافي','رسمي','مرح','هادئ ومتعاطف','خليجي ودود'].map(function(l){return '<option '+(l===v.tone?'selected':'')+'>'+l+'</option>'}).join('')+'</select></label></div><label class="lbl2">النموذج (يُحفظ لكل Agent)<select name="model" class="inp-s">'+AI_MODELS.map(function(l){return '<option '+(l===v.model?'selected':'')+'>'+l+'</option>'}).join('')+'</select></label><label class="lbl2">رسالة الترحيب<input name="welcome" class="inp-s" value="'+esc(v.welcome)+'"></label><label class="lbl2">رسالة عدم المعرفة (Fallback)<input name="fallback" class="inp-s" value="'+esc(v.fallback)+'"></label><div class="flex gap-2 pt-2"><button class="btn-primary flex-1">حفظ الـ Agent</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');}
function widgetModal(){
modal('<h3 class="font-display font-bold text-lg mb-4">Widget جديد</h3><form id="f-widget" class="space-y-3"><label class="lbl2">اسم الويدجت<input name="name" required class="inp-s" placeholder="مثال: ويدجت المتجر"></label><label class="lbl2">اربطه بـ Agent محدد (معرفة معزولة)<select name="agentId" class="inp-s">'+ws().agents.map(function(a){return '<option value="'+a.id+'">'+esc(a.name)+'</option>'}).join('')+'</select></label><button class="btn-primary w-full">إنشاء وحفظ في قاعدة البيانات</button></form>');}
function embedModal(id){
var w=ws().widgets.find(function(x){return x.id===id});if(!w)return;
var api=apiBase()||'https://YOUR-PROJECT.supabase.co/functions/v1';
modal('<h3 class="font-display font-bold text-lg mb-2">كود التضمين</h3><p class="text-xs text-ink-400 mb-4">ألصق هذا السطر قبل وسم الإغلاق &lt;/body&gt; في موقعك. استبدل مصدر السكربت برابط استضافة widget.js الفعلي لديك.</p><div class="ltr bg-ink-950 border border-ink-800 rounded-xl p-4 font-mono text-xs text-tiffany-300 overflow-x-auto whitespace-pre mb-4">&lt;script src="https://cdn.aown.app/widget.js"\ndata-widget-id="'+w.id+'"\ndata-token="'+w.token+'"\ndata-api="'+esc(api)+'" async&gt;&lt;/script&gt;</div><div class="flex flex-wrap gap-2 mb-4"><button data-action="copy-embed" data-id="'+w.id+'" class="btn-primary !py-2 text-xs">'+icon('copy','w-3.5 h-3.5')+' نسخ الكود</button><button data-action="regen" data-id="'+w.id+'" class="btn-ghost !py-2 text-xs">'+icon('bolt','w-3.5 h-3.5')+' إعادة توليد الرمز</button><button data-action="w-toggle" data-id="'+w.id+'" class="btn-ghost !py-2 text-xs '+(w.enabled?'!text-red-300':'')+'">'+(w.enabled?'تعطيل الويدجت':'تفعيل الويدجت')+'</button></div><div class="text-[11px] mb-3 '+(w.enabled?'text-emerald-400':'text-red-400')+'">'+(w.enabled?'● الويدجت نشط':'● الويدجت معطل — لن يظهر للزوار')+'</div><button data-action="modal-close" class="btn-ghost w-full">إغلاق</button>');}
/* ================= Global events ================= */
document.addEventListener('click',function(e){
var sbBtn=e.target.closest('[data-action="sb"]');
if(sbBtn){var s=document.getElementById('sidebar');if(s){s.classList.toggle('max-lg:-translate-x-full')}
var o=document.getElementById('sb-overlay');if(o)o.classList.toggle('hidden');return}
var t=e.target&&e.target.closest?e.target.closest('[data-action]'):null;if(!t)return;
var a=t.dataset.action,id=t.dataset.id;
function cur(idv){return ws().widgets.find(function(x){return x.id===idv})}
function kbDoc(idv){return ws().kb.find(function(x){return x.id===idv})}
try{
if(a==='go')go(t.dataset.to);
else if(a==='scroll'){e.preventDefault();var el=document.querySelector(t.dataset.to);if(el)el.scrollIntoView({behavior:'smooth'})}
else if(a==='demo-enter'){
if(isRemote()){toast('أنت متصل بالخادم — سجّل الدخول أو أنشئ حسابًا حقيقيًا، أو افصل الاتصال لاستخدام وضع الضيف','err');return}
db.demo=true;if(!db.ws)db.ws=starterKit();persist();
toast('دخلت كضيف بدون حساب — جلستك وبياناتك تبقى محفوظة','ok');go('#/onboarding')}
else if(a==='logout'){
if(isRemote()){try{sbClient().auth.signOut()}catch(e3){}}
db.session=null;db.demo=false;db.ws=null;persist();
remoteUser=null;selConvo=null;draft=null;toast('تم تسجيل الخروج');go('#/')}
else if(a==='local-mode'){useLocalMode()}
else if(a==='sync-now'){
if(isRemote()&&db.ws&&db.ws.__wid){remoteBroken=false;save();toast('جارٍ إعادة المزامنة مع الخادم...','ok')}
else{
var reason='';
if(!window.supabase)reason='مكتبة Supabase لم تُحمّل — تحقق من الإنترنت أو CDN';
else if(!cfg||!cfg.url||!cfg.key)reason='لا توجد إعدادات اتصال — أدخلها من #/setup أو js/supabase-client.js';
else if(!db.ws||!db.ws.__wid)reason='لا توجد مساحة عمل — سجّل الدخول أولًا';
else reason='سبب غير معروف — افتح Console واكتب window.diagnoseSupabase()';
toast('لا يوجد اتصال خادم مهيأ: '+reason,'err');
console.error('[Sync] فشل المزامنة:',{supabaseLoaded:!!window.supabase,cfg:cfg,hasWs:!!(db.ws&&db.ws.__wid)});}}
else if(a==='soon-channel'){toast('قناة '+id+' ستتوفر في تحديث قادم — قناة الويدجت مفعّلة لك الآن','ok')}
else if(a==='new-agent'){
var lim=PLANS[ws().plan].agents;
if(ws().agents.length>=lim){toast('بلغت الحد الأقصى ('+lim+' Agents) في خطتك '+PLANS[ws().plan].name+' — قم بالترقية لزيادة العدد','err');go('#/app/billing');return}
agentModal()}
else if(a==='edit-agent')agentModal(id);
else if(a==='del-agent'){if(confirm('حذف هذا الـ Agent؟')){ws().agents=ws().agents.filter(function(x){return x.id!==id});save();route()}}
else if(a==='new-widget'){if(!ws().agents.length){toast('أنشئ Agent أولًا','err');go('#/app/agents');return}widgetModal()}
else if(a==='open-builder'){draft=null;go('#/app/builder?id='+id)}
else if(a==='save-widget'){
var wS=cur(draft.id);
if(wS){Object.assign(wS,draft);persist();
if(isRemote()){
var doneB=busy(t,'جارٍ الحفظ في قاعدة البيانات...');
syncWidgetToServer(wS).then(function(){if(doneB)doneB();toast('تم الحفظ في قاعدة البيانات ✔ — سينعكس على الويدجت المنشور فور تحميل الصفحة التالية','ok');save();})
.catch(function(err){wS.__unsynced=true;if(doneB)doneB();toast('فشل الحفظ في قاعدة البيانات: '+err.message,'err');save();route();});
}else{save();toast('تم حفظ إعدادات الويدجت ✔','ok')}}}
else if(a==='embed')embedModal(id);
else if(a==='copy-embed'){var wC=cur(id);if(wC){var apiC=apiBase()||'https://YOUR-PROJECT.supabase.co/functions/v1';copyText('<script src="https://cdn.aown.app/widget.js" data-widget-id="'+wC.id+'" data-token="'+wC.token+'" data-api="'+apiC+'" async><'+'/script>')}}
else if(a==='regen'){
var wR=cur(id);
if(wR){wR.token=uid('tk_');persist();
if(isRemote()){
var doneR=busy(t,'جارٍ التحديث في قاعدة البيانات...');
syncWidgetToServer(wR).then(function(){if(doneR)doneR();toast('تم توليد رمز جديد وحفظه في قاعدة البيانات ✔','ok');embedModal(id);save()})
.catch(function(err){wR.__unsynced=true;if(doneR)doneR();toast('فشل حفظ الرمز الجديد في قاعدة البيانات: '+err.message,'err');embedModal(id);save()});
}else{save();toast('تم توليد رمز جديد — الرمز القديم لم يعد صالحًا','ok');embedModal(id)}}}
else if(a==='w-toggle'){
var wT=cur(id);
if(wT){wT.enabled=!wT.enabled;persist();
var afterT=function(){if(document.getElementById('modal-root').children.length)embedModal(id);else route()};
if(isRemote()){
syncWidgetToServer(wT).then(function(){toast(wT.enabled?'تم تفعيل الويدجت وحفظه في قاعدة البيانات ✔':'تم تعطيل الويدجت وحفظه في قاعدة البيانات ✔','ok');save();afterT()})
.catch(function(err){wT.__unsynced=true;toast('حدث التغيير محليًا وفشلت المزامنة: '+err.message,'err');save();afterT()});
}else{save();toast(wT.enabled?'تم تفعيل الويدجت':'تم تعطيل الويدجت','ok');afterT()}}}
else if(a==='modal-close'){var isBk=t.classList&&t.classList.contains('fixed');if(!isBk||e.target===t)closeModal();}
else if(a==='kb-add'){kbTypeModal()}
else if(a==='kb-open'){
var kbid=(t.dataset&&t.dataset.id)?t.dataset.id:(t.getAttribute?t.getAttribute('data-id'):null);
kbTypeModalOpen(kbid);}
else if(a==='kb-diag-log'){
var docsL=ws().kb.map(function(k){return {name:k.name,type:k.type,status:k.status,agentId:k.agentId||'(مشترك)',chunks:k.chunkCount||0,lastSync:k.lastSync?new Date(k.lastSync).toISOString():'',error:k.error||''}});
console.group('KB Diagnostics');console.table(docsL);console.log('إجمالي المستندات:',docsL.length,'| إجمالي المقاطع:',docsL.reduce(function(a,k){return a+k.chunks},0));console.groupEnd();
toast('تمت طباعة التشخيص في console','ok')}
else if(a==='kb-reprocess'){
var docR=kbDoc(id);if(!docR)return;
if(docR.type==='url')processUrl(docR.name,docR);
else if(docR.type==='text')reIngestDoc(docR);
else if(docR.type==='file')reProcessFile(docR);}
else if(a==='kb-del'){
if(!confirm('حذف هذا المصدر ومقاطعه؟ لا يمكن التراجع.'))return;
var docD=kbDoc(id);if(!docD)return;
ws().kb=ws().kb.filter(function(x){return x.id!==id});persist();
if(isRemote()&&cfg&&apiBase()){
fetch(apiBase()+'/kb-ingest',{method:'POST',headers:{'Content-Type':'application/json','api-key':cfg.key},body:JSON.stringify({doc_id:docD.id,delete:true})})
.then(function(r){return r.json().catch(function(){return{}})}).then(function(j){toast(j&&j.ok?'تم حذف المصدر ومقاطعه من قاعدة البيانات ✔':'حُذف المصدر محليًا — تحقّق من حذف المقاطع يدويًا (راجع تبويب التشخيص)',j&&j.ok?'ok':'err');save();route()})
.catch(function(err){console.error(err);toast('حُذف محليًا لكن فشل الحذف من الخادم: '+arErr(err.message),'err');save();route()});
}else{save();route()}
return}
else if(a==='kb-sync'){
var docS=kbDoc(id);
if(docS&&docS.type==='url'){toast('جارٍ إعادة مزامنة الموقع...');processUrl(docS.name,docS)}
else toast('المزامنة متاحة لمصادر الروابط فقط','err')}
else if(a==='kb-edit'){var docE=kbDoc(id);if(docE)modal('<h3 class="font-display font-bold mb-3">تعديل المصدر اليدوي</h3><form id="f-kb-edit" class="space-y-3"><input type="hidden" name="id" value="'+docE.id+'"><label class="lbl2">العنوان (اختياري)<input name="title" class="inp-s" value="'+esc(docE.name)+'"></label><label class="lbl2">المحتوى (مصدر معرفة فقط)<textarea name="content" rows="8" class="inp-s">'+esc(docE.content||'')+'</textarea></label><button class="btn-primary w-full">حفظ وإعادة المعالجة</button></form>')}
/* ── شراء حزم الردود ── */
else if(a==='buy-package'){
var pkg=PKGS.find(function(p){return p.id===id});if(!pkg)return;
modal('<h3 class="font-display font-bold text-xl mb-4">شراء '+pkg.name+'</h3><div class="space-y-4">'
+'<div class="glass rounded-xl p-4"><div class="flex justify-between mb-2"><span>عدد الردود:</span><span class="font-bold">'+pkg.credits.toLocaleString()+' رد</span></div>'
+'<div class="flex justify-between mb-2"><span>السعر:</span><span class="font-bold text-tiffany-400">$'+pkg.price+'</span></div>'
+'<div class="flex justify-between text-sm text-ink-400"><span>سعر الرد:</span><span>$'+(pkg.price/pkg.credits).toFixed(3)+'</span></div></div>'
+'<div class="text-xs text-ink-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">⚠️ بوابة الدفع الحقيقية (Stripe/PayPal) ستكون متاحة في تحديث قادم. حاليًا يُضاف الرصيد مباشرة للاختبار.</div>'
+'<div class="flex gap-2"><button data-action="modal-close" class="btn-ghost flex-1">إلغاء</button><button data-action="confirm-purchase" data-id="'+pkg.id+'" class="btn-primary flex-1">تأكيد الشراء</button></div></div>');}
else if(a==='confirm-purchase'){
var pkg2=PKGS.find(function(p){return p.id===id});if(!pkg2)return;
var s=ws();
if(isRemote()&&s&&s.__wid){
var doneP=busy(t,'جارٍ إضافة الرصيد...');
sbClient().rpc('purchase_credits',{ws_id:s.__wid,pkg_id:pkg2.id,payment_metadata:{test:true}}).then(function(r){
if(doneP)doneP();
if(r.data&&r.data.ok){s.credits_balance=r.data.new_balance;
s.credit_history=s.credit_history||[];
s.credit_history.unshift({type:'purchase',amount:pkg2.credits,description:'شراء '+pkg2.name,price:pkg2.price,created_at:new Date().toISOString()});
save();closeModal();toast('تمت إضافة '+pkg2.credits.toLocaleString()+' رد إلى رصيدك ✔','ok');route();}
else{toast('فشلت عملية الشراء على الخادم','err');}})
.catch(function(err){if(doneP)doneP();toast('فشلت عملية الشراء: '+err.message,'err');});
}else{
s.credits_balance=(s.credits_balance||0)+pkg2.credits;
s.credit_history=s.credit_history||[];
s.credit_history.unshift({type:'purchase',amount:pkg2.credits,description:'شراء '+pkg2.name,price:pkg2.price,created_at:new Date().toISOString()});
save();closeModal();toast('تمت إضافة '+pkg2.credits.toLocaleString()+' رد إلى رصيدك ✔','ok');route();}}
else if(a==='ob-next'){var st=ws().settings;var curStep=st.onboardingStep||st.obStep||1;
if(curStep===1&&!String(st.name||'').trim()){toast('اكتب اسم النشاط أولًا','err');return}
if(curStep===2&&!(st.goals&&st.goals.length)){toast('اختر هدفًا واحدًا على الأقل','err');return}
if(curStep===6&&!st.obBuilt){toast('انتظر اكتمال البناء','err');return}
st.onboardingStep=curStep+1;st.obStep=curStep+1;save();route()}
else if(a==='ob-back'){var st2=ws().settings;var cs=st2.onboardingStep||st2.obStep||1;if(cs>1){st2.onboardingStep=cs-1;st2.obStep=cs-1;save();route()}}
else if(a==='ob-goal'){var st3=ws().settings;var g=t.dataset.id;st3.goals=st3.goals||[];var gi=st3.goals.indexOf(g);if(gi>-1)st3.goals.splice(gi,1);else st3.goals.push(g);save();route()}
else if(a==='ob-skip'){var st4=ws().settings;st4.onboarded=true;save();toast('تم تخطي التهيئة','ok');go('#/app')}
else if(a==='ob-finish'){var st5=ws().settings;st5.onboarded=true;save();toast('🎉 تم إنهاء الإعداد — حصلت على 20 ردًا مجانيًا — أهلًا بك في لوحة إدارة ســوشـــيــــال','ok');go('#/app')}
else if(a==='ob-goto'){var st6=ws().settings;var ns=parseInt(t.dataset.id||'1',10);st6.onboardingStep=ns;st6.obStep=ns;save();route()}
else if(a==='ob-build'){obRunBuild()}
else if(a==='ob-test-page'){var st7=ws().settings;go('#/test?wid='+(st7.obWidgetId||st7.onboardingWidgetId||''))}
else if(a==='ob-builder'){var st8=ws().settings;var owid=st8.obWidgetId||st8.onboardingWidgetId;if(owid){draft=null;go('#/app/builder?id='+owid)}else toast('لم يتم إنشاء الويدجت بعد','err')}
else if(a==='handoff'){var c=ws().convos.find(function(x){return x.id===id});if(c){c.status='handoff';c.messages.push({from:'system',text:'تم تحويل المحادثة يدويًا لفريق الدعم.',at:now()});var cust0=ws().contacts.find(function(x){return x.id===c.contactId});if(cust0)cust0.class='يحتاج متابعة';save();route()}}
else if(a==='ai-back'){var c2=ws().convos.find(function(x){return x.id===id});if(c2){c2.status='active';c2.messages.push({from:'system',text:'أعاد الموظف تفعيل المساعد الذكي.',at:now()});save();route()}}
else if(a==='close-convo'){var c3=ws().convos.find(function(x){return x.id===id});if(c3){c3.status='closed';save();route()}}
else if(a==='reopen-convo'){var c4=ws().convos.find(function(x){return x.id===id});if(c4){c4.status='active';save();route()}}
else if(a==='del-convo'){if(confirm('حذف المحادثة؟')){ws().convos=ws().convos.filter(function(x){return x.id!==id});selConvo=null;save();route()}}
else if(a==='del-contact'){if(confirm('حذف العميل؟')){ws().contacts=ws().contacts.filter(function(x){return x.id!==id});save();route()}}
else if(a==='add-tag'){var c5=ws().contacts.find(function(x){return x.id===id});var v=prompt('اسم الوسم:');if(v&&c5){c5.tags=[...new Set((c5.tags||[]).concat([v]))];save();route()}}
else if(a==='note'){var c6=ws().contacts.find(function(x){return x.id===id});if(c6)modal('<h3 class="font-display font-bold mb-3">ملاحظات '+esc(c6.name)+'</h3><textarea id="note-ta" rows="5" class="inp-s w-full">'+esc(c6.notes||'')+'</textarea><button data-action="note-save" data-id="'+c6.id+'" class="btn-primary w-full mt-3">حفظ</button>')}
else if(a==='note-save'){var c7=ws().contacts.find(function(x){return x.id===id});if(c7){c7.notes=document.getElementById('note-ta').value;save();closeModal();toast('تم حفظ الملاحظات','ok')}}
else if(a==='del-member'){var tm=ws().settings.team;if(tm){tm.splice(parseInt(id,10),1);save();toast('تمت إزالة العضو','ok');route()}}
else if(a==='av'){if(draft){draft.avatar=t.dataset.v;route()}}
else if(a==='rm-logo'){if(draft){draft.logo='';route()}}
else if(a==='tg'){if(draft){var k=t.dataset.b;draft[k]=!draft[k];route()}}
else if(a==='save-settings'){ws().settings.name=document.getElementById('s-name').value;ws().settings.type=document.getElementById('s-type').value;ws().settings.lang=document.getElementById('s-lang').value;ws().settings.tz=document.getElementById('s-tz').value;save();toast('تم حفظ الإعدادات','ok')}
else if(a==='reset-ws'){if(confirm('سيتم حذف كل البيانات وإعادة بيانات البداية. متابعة؟')){var wid0=db.ws&&db.ws.__wid;db.ws=starterKit();if(wid0)db.ws.__wid=wid0;save();selConvo=null;draft=null;toast('تمت إعادة التعيين','ok');route()}}
else if(a==='del-account'){
if(isRemote()){toast('حذف الحساب يتم من إعدادات المصادقة في Supabase','err')}
else if(confirm('حذف الحساب نهائيًا من هذا الجهاز؟')){db.users=db.users.filter(function(u){return u.id!==db.session});db.session=null;db.ws=null;persist();go('#/')}}
else if(a==='choose-plan'){ws().plan=id;ws().invoices.unshift({id:uid('inv_'),plan:PLANS[id].name,amount:PLANS[id].price,date:now(),status:'مدفوعة'});save();toast('تم تغيير خطتك إلى '+PLANS[id].name+' 🎉','ok');route()}
else if(a==='inv')toast('تم تجهيز الفاتورة (نسخة عرض)','ok');
else if(a==='sb-disconnect'){cfg=null;sb=null;remoteBroken=false;try{localStorage.removeItem('aown_cfg')}catch(e2){}toast('تم فصل الاتصال — العودة للوضع المحلي','ok');route()}
else if(a==='eng-tab'){engTab=id;route()}
else if(a==='copy-eng'){if(engTab==='steps'){var tmp=document.createElement('div');tmp.innerHTML=ENG_STEPS;copyText(tmp.textContent.trim())}else copyText(engSource(engTab))}
else if(a==='sync-widget'){
var wY=cur(id);
if(wY){var doneY=busy(t,'جارٍ المزامنة...');
syncWidgetToServer(wY).then(function(){if(doneY)doneY();toast('تمت المزامنة مع قاعدة البيانات ✔','ok');save();route()})
.catch(function(err){if(doneY)doneY();toast('فشلت المزامنة: '+err.message,'err');route()});}}
else if(a==='del-widget'){
if(confirm('حذف هذا الويدجت؟')){
ws().widgets=ws().widgets.filter(function(x){return x.id!==id});persist();
if(isRemote()){
sbDeleteRow('widgets',id).then(function(){toast('تم حذف الويدجت من قاعدة البيانات ✔','ok');save();route()})
.catch(function(err){toast('حُذف محليًا لكن فشل الحذف من قاعدة البيانات: '+err.message,'err');save();route()});
}else{save();route()}}}
else if(a==='w-open'||a==='w-close'){}
else {console.warn('إجراء غير معروف:',a)}
}catch(err){console.error(err);toast('تعذر تنفيذ العملية','err')}});
document.addEventListener('input',function(e){
var el=e.target;if(!el)return;
var ob=el.dataset?el.dataset.ob:null;
if(ob&&ws()&&ws().settings){
ws().settings[ob]=el.value;persist();
if(ob==='name'){
var nb=document.getElementById('ob-next-btn');
if(nb){var ok=String(ws().settings.name||'').trim().length>0;nb.disabled=!ok;nb.style.opacity=ok?'1':'0.4';if(ok)nb.classList.add('ob-next-active');else nb.classList.remove('ob-next-active');}
var h2=document.querySelector('.fadeUp h2');if(h2)h2.innerHTML='أهلًا '+(esc(String(ws().settings.name||'').trim())||'بك')+' في إدارة ســوشـــيــــال، لنجهّز وكيلك';}
return;}
var b=el.dataset?el.dataset.b:null;
if(!b||!draft)return;
draft[b]=el.type==='range'?parseFloat(el.value):el.value;
renderPreview();});
document.addEventListener('change',function(e){
var tgt=e.target;if(!tgt)return;
if(tgt.id==='w-avatar-file'||tgt.id==='w-logo-file'){var f=tgt.files[0];if(!f||!draft)return;var r=new FileReader();
r.onload=function(){if(tgt.id==='w-avatar-file')draft.avatar=r.result;else draft.logo=r.result;route()};r.readAsDataURL(f);return}
var b=tgt.dataset?tgt.dataset.b:null;
if(!b||!draft)return;
draft[b]=tgt.type==='checkbox'?tgt.checked:tgt.value;
route();});
document.addEventListener('submit',async function(e){
var f=e.target;if(!f||!f.id)return;
if(f.classList&&f.classList.contains('w-form'))return;
e.preventDefault();
var fd=new FormData(f);
try{
if(f.id==='f-setup'){
var u=String(fd.get('url')).trim().replace(/\/+$/,''),k=String(fd.get('key')).trim();
if(!/^https:\/\/[a-z0-9.-]+\.supabase\.co$/i.test(u)){toast('رابط Supabase غير صالح','err');return}
cfg={url:u,key:k};sb=null;remoteBroken=false;
lsSet('aown_cfg',JSON.stringify(cfg));
var c=sbClient();
if(!c){toast('تعذر إنشاء اتصال Supabase — تأكد من اتصال الإنترنت وتحميل مكتبة Supabase','err');return}
toast('جارٍ فحص الاتصال...');
c.from('workspaces').select('id',{count:'exact',head:true}).then(function(res){
var st=document.getElementById('sb-status');
if(res.error){
var msg=res.error.message||'';
if(isNetErr(msg)){toast('فشل الاتصال بالشبكة — تحقق من الإنترنت أو تابع بالوضع المحلي','err')}
else if(/policy|permission|42501/i.test(msg)){toast('متصل ✔ لكن سياسات RLS غير مفعلة — شغّل مخطط SQL كاملًا','err')}
else if(/does not exist|PGRST|relation/i.test(msg)){toast('متصل ✔ لكن الجداول غير موجودة — شغّل مخطط SQL أولًا','err')}
else{toast('فشل الاتصال: '+msg,'err')}
if(st)st.innerHTML='<div class="glass rounded-2xl p-5 text-sm text-red-300 border-red-500/30">⚠️ '+esc(msg)+'</div>';
}else{
toast('الاتصال ناجح وقاعدة البيانات جاهزة ✔','ok');
if(st)st.innerHTML='<div class="glass rounded-2xl p-5 text-sm text-emerald-300 border-emerald-500/30">✅ Supabase جاهز — أنشئ حسابًا جديدًا وسيفتح معالج التهيئة تلقائيًا.</div>';
route();}}).catch(function(err){toast('فحص الاتصال فشل: '+arErr(err&&err.message),'err')});
return}
if(f.id==='f-login'){
var em=String(fd.get('email')).trim(),pw=fd.get('pass');
if(isRemote()){
var b=document.getElementById('b-login');if(b){b.disabled=true;b.textContent='جارٍ الدخول...'}
sbClient().auth.signInWithPassword({email:em,password:pw}).then(async function(res){
if(res.error){
if(isNetErr(res.error.message)){authNetFail(res.error.message)}
else toast(res.error.message==='Invalid login credentials'?'بيانات الدخول غير صحيحة':res.error.message,'err');
if(b){b.disabled=false;b.textContent='تسجيل الدخول'}return}
remoteUser=res.data.user;db.demo=false;
toast('جارٍ تحميل مساحة العمل...');
var ok=false;try{ok=await loadRemote()}catch(eL){console.error(eL)}
if(!ok){if(!db.ws){db.ws=starterKit();db.ws.__offline=true;persist()}remoteBroken=true;toast('تعذر تحميل بيانات الخادم — تعمل الآن بالوضع المحلي مؤقتًا','err')}
toast('مرحبًا بعودتك 👋 — جلستك محفوظة','ok');go((db.ws&&db.ws.settings.onboarded===true)?'#/app':'#/onboarding')}).catch(function(err){
if(b){b.disabled=false;b.textContent='تسجيل الدخول'}
if(isNetErr(err&&err.message)){authNetFail(err.message)}else toast('خطأ غير متوقع أثناء الدخول','err')});
return}
var u=db.users.find(function(x){return x.email===em&&x.pw===hashPw(pw)});
if(!u){toast('بيانات الدخول غير صحيحة','err');return}
db.session=u.id;db.demo=false;persist();
if(!db.ws)db.ws=starterKit();persist();
toast('مرحبًا بعودتك 👋 — جلستك محفوظة','ok');go((db.ws&&db.ws.settings.onboarded===true)?'#/app':'#/onboarding')}
else if(f.id==='f-signup'){
var em2=String(fd.get('email')).trim(),pw2=fd.get('pass');
if(isRemote()){
var b2=document.getElementById('b-signup');if(b2){b2.disabled=true;b2.textContent='جارٍ إنشاء الحساب...'}
sbClient().auth.signUp({email:em2,password:pw2,options:{data:{name:fd.get('name'),company:fd.get('company')}}}).then(async function(res){
if(res.error){
if(isNetErr(res.error.message)){authNetFail(res.error.message)}
else toast(res.error.message,'err');
if(b2){b2.disabled=false;b2.textContent='إنشاء الحساب والبدء'}return}
if(!res.data.session){toast('تم إرسال رابط تفعيل إلى بريدك — فعّل الحساب ثم سجّل الدخول','ok');if(b2){b2.disabled=false;b2.textContent='إنشاء الحساب والبدء'}go('#/login');return}
remoteUser=res.data.user;db.demo=false;
toast('جارٍ إنشاء مساحة العمل في قاعدة البيانات...');
var ok=false;try{ok=await loadRemote()}catch(eL2){console.error(eL2)}
if(!ok){if(!db.ws){db.ws=starterKit();db.ws.__offline=true;persist()}remoteBroken=true}
if(db.ws){var s=ws();s.settings.name=String(fd.get('company')).trim()||s.settings.name;s.settings.type=fd.get('type');save()}
toast('تم إنشاء حسابك في إدارة ســوشـــيــــال 🎉 لنجهّز وكيلك','ok');go('#/onboarding')}).catch(function(err){
if(b2){b2.disabled=false;b2.textContent='إنشاء الحساب والبدء'}
if(isNetErr(err&&err.message)){authNetFail(err.message)}else toast('خطأ غير متوقع أثناء إنشاء الحساب','err')});
return}
if(db.users.some(function(x){return x.email===em2})){toast('البريد مسجل مسبقًا','err');return}
var nu={id:uid('u_'),name:String(fd.get('name')).trim(),email:em2,pw:hashPw(pw2),createdAt:now()};
db.users.push(nu);db.session=nu.id;db.demo=false;db.ws=starterKit();db.ws.settings.name=String(fd.get('company')).trim();db.ws.settings.type=fd.get('type');persist();
toast('تم إنشاء مساحة عملك 🎉 لنجهّز وكيلك','ok');go('#/onboarding')}
else if(f.id==='f-forgot'){
var em3=String(fd.get('email')).trim();
if(isRemote()){
sbClient().auth.resetPasswordForEmail(em3,{redirectTo:location.origin+'#/login'}).then(function(res){
if(res.error){
if(isNetErr(res.error.message)){authNetFail(res.error.message)}
else toast(res.error.message,'err')}
else toast('إن وجد الحساب، وصلك رابط الاستعادة على بريدك. افتح الرابط لتعيين كلمة مرور جديدة.','ok')}).catch(function(err){authNetFail(err&&err.message)});
return}
toast('استعادة كلمة المرور تتطلب خادمًا — في الوضع المحلي يمكنك إنشاء حساب جديد','err')}
else if(f.id==='f-newpass'){
var np=fd.get('pass');
if(String(np).length<6){toast('كلمة المرور يجب أن تكون 6 أحرف على الأقل','err');return}
var btn=f.querySelector('button');if(btn){btn.disabled=true;btn.textContent='جارٍ الحفظ...'}
sbClient().auth.updateUser({password:np}).then(function(res){
if(res.error){toast(res.error.message,'err');if(btn){btn.disabled=false;btn.textContent='حفظ كلمة المرور الجديدة'}return}
closeModal();toast('تم تحديث كلمة المرور بنجاح ✔','ok');go('#/login')});
return}
else if(f.id==='f-agent'){
var idv=fd.get('id');var data=Object.fromEntries(fd);
var agentObj;
if(idv){agentObj=ws().agents.find(function(x){return x.id===idv});if(agentObj)Object.assign(agentObj,data)}
else{agentObj=Object.assign({},data,{id:uid('ag_'),createdAt:now()});ws().agents.push(agentObj)}
persist();
if(isRemote()&&agentObj){
var bA=f.querySelector('button');var doneA=busy(bA,'جارٍ الحفظ في قاعدة البيانات...');
try{await sbUpsert('agents',agentObj);if(doneA)doneA();toast('تم حفظ الـ Agent في قاعدة البيانات ✔','ok');save();closeModal();route();}
catch(err){if(doneA)doneA();toast('فشل حفظ الـ Agent في قاعدة البيانات: '+err.message,'err');save();closeModal();route();}
}else{save();closeModal();toast('تم حفظ الـ Agent ✔','ok');route()}
return}
else if(f.id==='f-widget'){
var nw=defWidget(fd.get('agentId'),String(fd.get('name')).trim());
ws().widgets.push(nw);persist();
var bW=f.querySelector('button');
if(isRemote()){
var doneW=busy(bW,'جارٍ الحفظ في قاعدة البيانات...');
syncWidgetToServer(nw).then(function(){if(doneW)doneW();toast('تم إنشاء الويدجت في قاعدة البيانات ✔','ok');save();closeModal();draft=null;go('#/app/builder?id='+nw.id);})
.catch(function(err){nw.__unsynced=true;if(doneW)doneW();toast('أُنشئ محليًا لكن فشلت المزامنة: '+err.message,'err');save();closeModal();draft=null;go('#/app/builder?id='+nw.id);});
}else{save();closeModal();draft=null;go('#/app/builder?id='+nw.id)}
return}
else if(f.id==='f-kbm-file'){
var fi=document.getElementById('kb-filepick');var file=fi&&fi.files[0];
if(!file){toast('اختر ملفًا أولًا — اضغط على منطقة الرفع أو اسحب الملف','err');return}
var agF=document.getElementById('kbm-file-agent');
closeModal();
processFile(file,agF?agF.value:'');
return}
else if(f.id==='f-kbm-text'){
var contentT=String(fd.get('content')||'').trim();
if(!contentT){toast('اكتب نص المعرفة أولًا','err');return}
var titleT=String(fd.get('title')||'').trim();
var agT=document.getElementById('kbm-text-agent');
closeModal();
await processTextDoc(titleT,contentT,agT?agT.value:'');
return}
else if(f.id==='f-kbm-url'){
var urlU=String(fd.get('url')||'').trim();
if(!/^https?:\/\//i.test(urlU)){toast('الرابط يجب أن يبدأ بـ http أو https','err');return}
var agU=document.getElementById('kbm-url-agent');
var dU={id:uid('kb_'),name:urlU,type:'url',agentId:agU?agU.value:'',content:'جارٍ الزحف واستخراج المعلومات...',status:'processing',chunks:[],chunkCount:0,createdAt:now(),error:''};
ws().kb.unshift(dU);save();closeModal();refreshKbUI();
processUrl(urlU,dU);
return}
else if(f.id==='f-urlfallback'){
var docF=ws().kb.find(function(x){return x.id===fd.get('docId')});
var cntF=String(fd.get('content')||'').trim();
if(!docF){closeModal();return}
if(!cntF){toast('الصق محتوى الموقع أولًا','err');return}
docF.type='text';docF.content=cntF;docF.error='';
closeModal();
reIngestDoc(docF);
return}
else if(f.id==='f-kb-edit'){
var docU=ws().kb.find(function(x){return x.id===fd.get('id')});
if(docU){
var newContent=String(fd.get('content')||'').trim();
if(!newContent){toast('المحتوى لا يمكن أن يكون فارغًا','err');return}
docU.name=String(fd.get('title')||'').trim()||newContent.slice(0,60);
docU.content=newContent;
closeModal();
reIngestDoc(docU);}
return}
else if(f.id==='f-dash-msg'){var cd=ws().convos.find(function(x){return x.id===selConvo});if(!cd)return;
var txt=String(fd.get('m')||'').trim();if(!txt)return;
cd.messages.push({from:'team',text:txt,at:now()});cd.updatedAt=now();save();route()}
else if(f.id==='f-team'){ws().settings.team.push({email:String(fd.get('email')).trim(),role:'عضو'});save();toast('تمت إضافة العضو','ok');route()}
}catch(err){console.error(err);toast('تعذر تنفيذ العملية','err')}});
/* ================= Boot ================= */
window.addEventListener('error',function(ev){console.error('Social runtime error:',ev.message)});
async function boot(){
try{
loadDB();
if(!isRemote()&&db.demo&&!db.ws){db.ws=starterKit();persist()}
const c=sbClient();
if(c){
let s0=null;
try{s0=await c.auth.getSession()}catch(eS){console.warn('session fetch failed:',eS)}
remoteUser=(s0&&s0.data&&s0.data.session)?s0.data.session.user:null;
if(remoteUser)db.demo=false;
c.auth.onAuthStateChange(function(evt,session){
if(evt==='PASSWORD_RECOVERY'){
modal('<h3 class="font-display font-bold text-lg mb-2">تعيين كلمة مرور جديدة</h3><p class="text-xs text-ink-400 mb-4">تم التحقق من بريدك عبر رابط الاستعادة. اختر كلمة مرور جديدة لحسابك.</p><form id="f-newpass" class="space-y-3"><label class="lbl2">كلمة المرور الجديدة (6 أحرف على الأقل)<input name="pass" type="password" minlength="6" required class="inp-s" placeholder="••••••••"></label><button class="btn-primary w-full">حفظ كلمة المرور الجديدة</button></form>');
return;}
var nu=session?session.user:null;
if(nu&&nu.id!==(remoteUser&&remoteUser.id)){remoteUser=nu;db.demo=false;loadRemote().catch(function(){}).then(route)}
else if(!nu&&remoteUser){remoteUser=null;db.ws=null;route()}});
if(remoteUser){
var lok=false;
try{lok=await loadRemote()}catch(eL){console.error('loadRemote failed:',eL)}
if(!lok){
if(!db.ws){db.ws=starterKit();db.ws.__offline=true;persist()}
remoteBroken=true;
toast('تعذر الوصول للخادم — تعمل الآن بالوضع المحلي مؤقتًا','err');}
}
}
route();
}catch(err){
console.error('Boot error:',err);
document.getElementById('app').innerHTML='<div class="p-16 text-center text-ink-300"><p class="mb-3">تعذر تشغيل التطبيق: '+esc(err.message||String(err))+'</p><p class="text-xs text-ink-500">غالبًا السبب: حجب الإنترنت داخل الـ Preview (مكتبات CDN) أو حجب localStorage. جرّب فتح الملف مباشرة في المتصفح.</p><button onclick="location.hash=\'#/\'" class="btn-primary mt-4">إعادة المحاولة</button></div>';}}
boot();
