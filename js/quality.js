/* ═══ quality.js — المهمة ٤: مراجعة الردود + تصعيد الحساس + تحليلات القنوات ═══ */
(function(){

/* كلمات الحالات الحساسة */
var SENSITIVE=['غاضب','زعلان','احتيال','نصاب','سرق','سرقه','محامي','قضية','شكوى رسمية','وزارة','تجارة','تعويض','ارجع فلوسي','استرجاع فلوس','فضح','اعلام','صحفي','مقاطعة','بلاغ','شرطة','تهديد','حقير','غبي','نصبتم'];
function isSensitive(text){var t=norm(text);return SENSITIVE.some(function(w){return t.indexOf(norm(w))>-1})}
var CHN={widget:'ويدجت الموقع',telegram:'تليجرام',whatsapp:'واتساب',messenger:'ماسنجر',instagram:'انستغرام'};

/* ── 1) لفّ getAIReply: تصعيد حساس + مراجعة الويدجت ── */
var _getAIReply=window.getAIReply;
window.getAIReply=async function(text,agent,widget,convo){
  var res=await _getAIReply(text,agent,widget,convo);
  if(!res||res.system)return res;
  var s=ws();
  if(isSensitive(text)){
    s.escalations=s.escalations||[];
    s.escalations.unshift({id:uid('esc_'),q:text,convoId:convo?convo.id:null,channel:(convo&&convo.channel)||'widget',at:now(),status:'open'});
    s.escalations=s.escalations.slice(0,50);
    if(convo)convo.messages.push({from:'system',text:'⚠️ تم تصنيف المحادثة كحالة حساسة — تم إشعار الإدارة.',at:now()});
    save();
  }
  if(s&&s.settings&&s.settings.reviewWidget&&convo){
    convo.pendingReply=res.text;convo.reviewState='pending';convo.updatedAt=now();save();
    return {system:true,text:'📨 تم استلام رسالتك — سيصلك الرد بعد مراجعته من الفريق.'};
  }
  return res;
};

/* ── 2) عرض سجل المحادثة داخل الويدجت (ليظهر الرد المعتمد عند عودة الزائر) ── */
var _mountWidget=window.mountWidget;
window.mountWidget=function(host,w,agent,opts){
  var inst=_mountWidget(host,w,agent,opts);
  try{
    if(opts&&opts.persist&&inst){
      var s=ws(),vid=lsGet('aown_vid');
      var ct=s&&s.contacts.find(function(x){return x.vid===vid});
      var cv=ct&&s.convos.find(function(v){return v.contactId===ct.id&&v.widgetId===w.id});
      if(cv&&cv.messages&&cv.messages.length){
        var msgs=host.querySelector('.w-msgs');
        if(msgs){msgs.innerHTML='';
          cv.messages.forEach(function(m){
            var el=document.createElement('div');
            if(m.from==='system'){el.className='msg-in flex';el.innerHTML='<div class="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 w-full text-center">'+esc(m.text)+'</div>';}
            else{var vis=m.from==='visitor';
              el.className='msg-in flex '+(vis?'justify-start':'justify-end');
              el.innerHTML='<div class="max-w-[85%] text-sm leading-6 px-3.5 py-2.5 rounded-2xl '+(vis?'rounded-tr-sm':'rounded-tl-sm')+'" style="background:'+(vis?(w.userBg||'#22272f'):(w.aiBg||w.primary||'#0ABAB5'))+';color:'+(vis?(w.text||'#e8eaed'):'#fff')+'">'+md(m.text)+'</div>';}
            msgs.appendChild(el);});
          msgs.scrollTop=msgs.scrollHeight;}
      }
    }
  }catch(e){}
  return inst;
};

/* ── 3) مركز المراجعة والحالات الحساسة (أعلى الرئيسية) ── */
var _pgHome=window.pgHome;
window.pgHome=function(){
  var base=_pgHome();
  var s=ws();
  var pend=(s.convos||[]).filter(function(c){return c.reviewState==='pending'});
  var escs=(s.escalations||[]).filter(function(x){return x.status==='open'});
  if(!pend.length&&!escs.length)return base;
  var pendHtml=pend.map(function(c){
    var ct=s.contacts.find(function(x){return x.id===c.contactId});
    var last=(c.messages||[]).filter(function(m){return m.from==='visitor'}).pop();
    return '<div class="glass rounded-xl p-4 space-y-2"><div class="text-xs text-ink-500">'+esc((ct&&ct.name)||'زائر')+' • '+(CHN[c.channel||'widget']||'ويدجت')+' • '+timeAgo(c.updatedAt||now())+'</div>'
    +'<div class="text-sm">❓ '+esc((last&&last.text)||'')+'</div>'
    +'<div class="text-sm text-tiffany-300 bg-tiffany-500/5 border border-tiffany-500/20 rounded-lg p-2">🤖 '+esc(c.pendingReply||'')+'</div>'
    +'<div class="flex gap-2"><button data-action="rv-approve" data-id="'+c.id+'" class="btn-primary !py-1.5 !px-3 text-xs">اعتماد وإرسال</button><button data-action="rv-edit" data-id="'+c.id+'" class="btn-ghost !py-1.5 !px-3 text-xs">تعديل</button><button data-action="rv-reject" data-id="'+c.id+'" class="btn-ghost !py-1.5 !px-3 text-xs !text-red-300">رفض</button></div></div>';
  }).join('');
  var escHtml=escs.map(function(x){
    return '<div class="glass rounded-xl p-3 flex items-center gap-3"><div class="flex-1"><div class="text-sm">⚠️ '+esc(x.q)+'</div><div class="text-[10px] text-ink-500 mt-1">'+(CHN[x.channel]||'ويدجت')+' • '+timeAgo(x.at)+'</div></div><button data-action="esc-done" data-id="'+x.id+'" class="btn-ghost !py-1.5 !px-3 text-xs flex-none">تم التعامل</button></div>';
  }).join('');
  return '<div class="grid lg:grid-cols-2 gap-4 mb-6">'
  +(pend.length?'<div><h3 class="font-display font-bold mb-3">📨 ردود بانتظار مراجعتك ('+pend.length+')</h3><div class="space-y-3">'+pendHtml+'</div></div>':'')
  +(escs.length?'<div><h3 class="font-display font-bold mb-3">⚠️ حالات حساسة ('+escs.length+')</h3><div class="space-y-2">'+escHtml+'</div></div>':'')
  +'</div>'+base;
};

/* ── 4) تحليلات حسب القناة ── */
var _pgAnalytics=window.pgAnalytics;
window.pgAnalytics=function(){
  var base=_pgAnalytics();
  var s=ws();var chans={};
  (s.convos||[]).forEach(function(c){var k=c.channel||'widget';chans[k]=(chans[k]||0)+1});
  var total=Math.max(1,(s.convos||[]).length);
  var rows=Object.keys(chans).map(function(k){var n=chans[k];var pct=Math.round(n/total*100);
    return '<div class="flex items-center gap-3"><span class="text-xs text-ink-400 w-24 flex-none">'+(CHN[k]||k)+'</span><div class="flex-1 h-6 bg-ink-850 rounded-lg overflow-hidden"><div class="h-full bg-tiffany-500/25 border-l border-tiffany-500/50 flex items-center px-3 text-xs" style="width:'+Math.max(pct,8)+'%">'+n+' محادثة</div></div></div>';}).join('');
  return base+'<div class="glass rounded-2xl p-6 mt-4"><h3 class="font-display font-bold mb-4">المحادثات حسب القناة</h3><div class="space-y-2">'+(rows||'<p class="text-sm text-ink-500">لا بيانات بعد.</p>')+'</div></div>';
};

/* ── 5) مفتاح مركز الجودة في الإعدادات ── */
var _pgSettings=window.pgSettings;
window.pgSettings=function(){
  var base=_pgSettings();
  var s=ws();var on=!!(s.settings.reviewWidget);
  return base+'<div class="glass rounded-2xl p-6 mt-5"><h3 class="font-display font-bold mb-2">🛡️ مركز الجودة</h3>'
  +'<p class="text-xs text-ink-500 mb-4">عند التفعيل: كل رد من الويدجت أو القنوات يُحفظ «بانتظار المراجعة» ولا يصل للعميل حتى تعتمده من الرئيسية. الحالات الحساسة (غضب/تهديد/قضايا) تُصعَّد لك تلقائيًا دائمًا.</p>'
  +'<button data-action="qw-toggle" class="switch'+(on?' on':'')+'" title="تفعيل/تعطيل"></button> <span class="text-sm mr-2">'+(on?'مراجعة الردود قبل الإرسال: مفعّلة':'مراجعة الردود قبل الإرسال: متوقفة')+'</span></div>';
};

/* ── المعالجات ── */
function sendApproved(c){
  var s=ws();
  if(c.channel&&isRemote()&&s&&s.__wid){
    return fetch(apiBase()+'/channel-webhook?act=approve&ws='+s.__wid+'&cv='+c.id).then(function(){}).catch(function(){});
  }
  return Promise.resolve();
}
document.addEventListener('click',function(e){
  var t=e.target&&e.target.closest?e.target.closest('[data-action]'):null;if(!t)return;
  var a=t.dataset.action,id=t.dataset.id;var s=ws();
  if(a==='rv-approve'){
    var c=s.convos.find(function(x){return x.id===id});if(!c||!c.pendingReply)return;
    c.messages.push({from:'ai',text:c.pendingReply,at:now()});
    c.reviewState='approved';delete c.pendingReply;c.updatedAt=now();save();
    sendApproved(c).then(function(){toast('تم اعتماد الرد وإرساله ✔','ok');route()});
  }
  else if(a==='rv-edit'){
    var c2=s.convos.find(function(x){return x.id===id});if(!c2)return;
    modal('<h3 class="font-display font-bold mb-3">تعديل الرد قبل الإرسال</h3><form id="f-rvedit" class="space-y-3"><input type="hidden" name="cid" value="'+c2.id+'"><textarea name="reply" rows="6" class="inp-s">'+esc(c2.pendingReply||'')+'</textarea><div class="flex gap-2"><button class="btn-primary flex-1">حفظ واعتماد</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');
  }
  else if(a==='rv-reject'){
    var c3=s.convos.find(function(x){return x.id===id});if(!c3)return;
    c3.reviewState='rejected';delete c3.pendingReply;save();toast('تم رفض الرد','ok');route();
  }
  else if(a==='esc-done'){
    var x=(s.escalations||[]).find(function(y){return y.id===id});if(x)x.status='done';save();route();
  }
  else if(a==='qw-toggle'){
    var on=!(s.settings.reviewWidget);s.settings.reviewWidget=on;
    (s.channels||[]).forEach(function(ch){ch.reviewMode=on;
      if(isRemote()&&s.__wid){try{sbClient().from('channels').upsert({id:'ch_'+s.__wid+'_'+ch.type,workspace_id:s.__wid,data:ch},{onConflict:'id'}).then(function(){}).catch(function(){})}catch(e){}}});
    save();toast(on?'تم تفعيل مراجعة الردود قبل الإرسال ✔':'تم إيقاف المراجعة','ok');route();
  }
});
document.addEventListener('submit',function(e){
  var f=e.target;if(!f||f.id!=='f-rvedit')return;
  e.preventDefault();
  var fd=new FormData(f);var s=ws();
  var c=s.convos.find(function(x){return x.id===fd.get('cid')});if(!c)return;
  var txt=String(fd.get('reply')||'').trim();if(!txt){toast('اكتب الرد','err');return}
  c.pendingReply=txt;closeModal();
  c.messages.push({from:'ai',text:txt,at:now()});c.reviewState='approved';delete c.pendingReply;c.updatedAt=now();save();
  sendApproved(c).then(function(){toast('تم اعتماد الرد المعدّل وإرساله ✔','ok');route()});
});

if(typeof route==='function')route();
})();
