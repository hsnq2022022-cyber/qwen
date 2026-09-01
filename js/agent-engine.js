/* ═══════════════════════════════════════════════════════════
   Agent Engine v2 — المهمة ٢
   برومبت متقدم + قواعد + كلمات مفتاحية + سجل الأسئلة + تدريب
   يُحمَّل بعد main.js ويوسّعه دون تعديله.
═══════════════════════════════════════════════════════════ */

/* ---------- أدوات ---------- */
function parseKeywords(str){
  var out=[];
  String(str||'').split(/\n+/).forEach(function(line){
    var i=line.indexOf('|');
    if(i>-1){
      var k=norm(line.slice(0,i)).trim();
      var v=line.slice(i+1).trim();
      if(k&&v)out.push({k:k,v:v});
    }
  });
  return out;
}
function parseRules(str){
  return String(str||'').split(/\n+/).map(function(s){return s.trim()}).filter(Boolean);
}

/* ---------- نافذة Agent موسّعة ---------- */
var _agentModal=window.agentModal;
window.agentModal=function(id){
  var a=id?ws().agents.find(function(x){return x.id===id}):null;
  var v=a||{name:'',desc:'',avatar:AVT[0],instructions:'',language:'العربية',tone:'ودي واحترافي',model:'gemini-2.5-flash-lite',welcome:'أهلًا بك 👋 كيف أقدر أساعدك؟',fallback:NO_INFO_MSG,sysprompt:'',rules:'',keywords:''};
  var avs=AV_LOCAL.map(function(u){return '<label class="cursor-pointer"><input type="radio" name="avatar" value="'+u+'" class="hidden peer" '+(v.avatar===u?'checked':'')+'><img src="'+u+'" class="w-12 h-12 rounded-xl object-cover border-2 peer-checked:border-tiffany-500 border-transparent"></label>'}).join('');
  modal('<h3 class="font-display font-bold text-lg mb-5">'+(a?'تعديل':'إنشاء')+' Agent — المحرك المتقدم</h3><form id="f-agent" class="space-y-3">'
  +'<input type="hidden" name="id" value="'+((a&&a.id)||'')+'">'
  +'<label class="lbl2">اسم الـ Agent *<input name="name" required class="inp-s" value="'+esc(v.name)+'" placeholder="مثال: موظف المبيعات"></label>'
  +'<label class="lbl2">الوصف (شخصية المساعد)<input name="desc" class="inp-s" value="'+esc(v.desc)+'"></label>'
  +'<div class="text-xs text-ink-400 mb-1">Avatar</div><div class="flex gap-2 mb-1">'+avs+'</div>'
  +'<label class="lbl2">التعليمات الأساسية *<textarea name="instructions" required rows="3" class="inp-s" placeholder="أنت موظف مبيعات لمتجر...">'+esc(v.instructions)+'</textarea></label>'
  +'<label class="lbl2">البرومبت المتقدم (System Prompt)<textarea name="sysprompt" rows="3" class="inp-s" placeholder="توجيهات دائمة إضافية... مثال: تحدث دائمًا بودّ، ولا تعد بأي موعد تسليم غير موجود في قاعدة المعرفة.">'+esc(v.sysprompt||'')+'</textarea></label>'
  +'<label class="lbl2">القواعد (سطر لكل قاعدة — تُطبق صارمًا)<textarea name="rules" rows="4" class="inp-s" placeholder="لا تقدم أي خصم دون موافقة الإدارة&#10;إذا كان العميل غاضبًا → اعتذر وحوّله لموظف فورًا&#10;لا تكشف معلومات داخلية">'+esc(v.rules||'')+'</textarea></label>'
  +'<label class="lbl2">الكلمات المفتاحية (سطر لكل كلمة)&#10;الصيغة: كلمة | رد مباشر&#10;أو: كلمة | kb (للبحث في قاعدة المعرفة)<textarea name="keywords" rows="4" class="inp-s" placeholder="اسعار | kb&#10;اوقات | kb&#10;خصم | عذرًا، لا تتوفر خصومات حاليًا.">'+esc(v.keywords||'')+'</textarea></label>'
  +'<div class="grid grid-cols-2 gap-3"><label class="lbl2">اللغة<select name="language" class="inp-s">'+['العربية','English','ثنائي اللغة'].map(function(l){return '<option '+(l===v.language?'selected':'')+'>'+l+'</option>'}).join('')+'</select></label><label class="lbl2">النبرة واللهجة<select name="tone" class="inp-s">'+['ودي واحترافي','رسمي','مرح','هادئ ومتعاطف','خليجي ودود'].map(function(l){return '<option '+(l===v.tone?'selected':'')+'>'+l+'</option>'}).join('')+'</select></label></div>'
  +'<label class="lbl2">النموذج<select name="model" class="inp-s">'+AI_MODELS.map(function(l){return '<option '+(l===v.model?'selected':'')+'>'+l+'</option>'}).join('')+'</select></label>'
  +'<label class="lbl2">رسالة الترحيب<input name="welcome" class="inp-s" value="'+esc(v.welcome)+'"></label>'
  +'<label class="lbl2">رسالة عدم المعرفة (Fallback)<input name="fallback" class="inp-s" value="'+esc(v.fallback)+'"></label>'
  +'<div class="flex gap-2 pt-2"><button class="btn-primary flex-1">حفظ الـ Agent</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');
};

/* ---------- المحرك المحلي: الكلمات المفتاحية أولًا ---------- */
var _aiRespondLocal=window.aiRespondLocal;
window.aiRespondLocal=function(text,agent,agentId){
  var t=norm(text);
  if(agent&&agent.keywords){
    var kws=parseKeywords(agent.keywords);
    for(var i=0;i<kws.length;i++){
      if(t.indexOf(kws[i].k)>-1){
        if(kws[i].v.toLowerCase()==='kb'){
          var hits=searchKB(text,agentId);
          if(hits.length&&hits[0].sc>=1)return {text:hits.map(function(h){return h.text}).join('\n')};
          break;
        }
        return {text:kws[i].v};
      }
    }
  }
  return _aiRespondLocal(text,agent,agentId);
};

/* ---------- سجل الأسئلة غير المُجابة ---------- */
function logGap(q,agentId){
  var s=ws();if(!s||!q)return;
  s.kb_gaps=s.kb_gaps||[];
  var g=s.kb_gaps.find(function(x){return x.q===q&&x.status!=='done'});
  if(g){g.count=(g.count||1)+1;g.at=now();}
  else{g={id:uid('gap_'),q:q,agentId:agentId||'',count:1,at:now(),status:'open'};s.kb_gaps.unshift(g);}
  s.kb_gaps=s.kb_gaps.slice(0,50);
  save();
  if(isRemote()&&s.__wid){
    try{sbClient().from('kb_gaps').upsert({id:g.id,workspace_id:s.__wid,data:g},{onConflict:'id'}).then(function(){}).catch(function(){});}catch(e){}
  }
}

/* لفّ getAIReply لتسجيل الأسئلة (في الوضع المحلي فقط — الخادم يسجل بنفسه) */
var _getAIReply=window.getAIReply;
window.getAIReply=async function(text,agent,widget,convo){
  var res=await _getAIReply(text,agent,widget,convo);
  if(res&&!res.system&&res.text===NO_INFO_MSG&&!isRemote()){logGap(text,widget?widget.agentId:(agent&&agent.id)||'');}
  return res;
};

/* ---------- واجهة السجل داخل صفحة Knowledge Base ---------- */
var _pgKB=window.pgKB;
window.pgKB=function(){
  var base=_pgKB();
  var s=ws();var gaps=(s&&s.kb_gaps)||[];
  var open=gaps.filter(function(g){return g.status!=='done'});
  var head='<div class="mt-8"><div class="flex items-center justify-between flex-wrap gap-2 mb-4"><h2 class="font-display font-bold text-xl">أسئلة لم يُجب عنها الوكيل ('+open.length+')</h2><p class="text-xs text-ink-500">كل سؤال عجز الوكيل عن إجابته يُسجّل هنا تلقائيًا — درّبه بنقرة.</p></div>';
  if(!gaps.length)return base+head+'<div class="glass rounded-2xl p-10 text-center text-ink-500">لا أسئلة معلّقة — الوكيل يجيب من معرفتك 🎉</div></div>';
  var rows=gaps.map(function(g){
    return '<div class="glass rounded-xl p-4 flex items-center gap-3 flex-wrap">'
    +'<div class="flex-1 min-w-[220px]"><div class="text-sm font-semibold">"'+esc(g.q)+'"</div><div class="text-[10px] text-ink-500 mt-1">تكرّر '+g.count+' مرة • '+timeAgo(g.at)+'</div></div>'
    +(g.status==='done'?'<span class="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5 flex-none">مُدرّب ✔</span>'
    :'<button data-action="gap-train" data-id="'+g.id+'" class="btn-primary !py-1.5 !px-3 text-xs flex-none">أضف إجابة ودرّب</button>')
    +'<button data-action="gap-del" data-id="'+g.id+'" class="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg flex-none">'+icon('trash','w-3.5 h-3.5')+'</button></div>';
  }).join('');
  return base+head+'<div class="space-y-2">'+rows+'</div></div>';
};

/* ---------- معالجات التدريب ---------- */
document.addEventListener('click',function(e){
  var t=e.target&&e.target.closest?e.target.closest('[data-action]'):null;if(!t)return;
  var a=t.dataset.action,id=t.dataset.id;
  if(a==='gap-train'){
    var g=(ws().kb_gaps||[]).find(function(x){return x.id===id});if(!g)return;
    modal('<h3 class="font-display font-bold mb-3">تدريب الوكيل على السؤال</h3>'
    +'<p class="text-xs text-ink-500 mb-3">السؤال: <b>"'+esc(g.q)+'"</b><br>اكتب الإجابة الصحيحة — ستُحفظ كمصدر معرفة جاهز مرتبط بالوكيل.</p>'
    +'<form id="f-gap" class="space-y-3"><input type="hidden" name="gapId" value="'+g.id+'">'
    +'<label class="lbl2">الإجابة الصحيحة *<textarea name="answer" rows="5" required class="inp-s" placeholder="اكتب الإجابة التي تريد أن يقولها الوكيل..."></textarea></label>'
    +'<label class="lbl2">ربط بـ Agent<select name="agentId" class="inp-s">'+agentOptions(g.agentId||'')+'</select></label>'
    +'<div class="flex gap-2"><button class="btn-primary flex-1">حفظ وتدريب</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');
  }
  else if(a==='gap-del'){
    var s=ws();s.kb_gaps=(s.kb_gaps||[]).filter(function(x){return x.id!==id});save();
    if(isRemote()&&s.__wid){try{sbClient().from('kb_gaps').delete().eq('id',id).then(function(){}).catch(function(){});}catch(e){}}
    route();
  }
});
document.addEventListener('submit',async function(e){
  var f=e.target;if(!f||f.id!=='f-gap')return;
  e.preventDefault();
  var fd=new FormData(f);
  var gapId=fd.get('gapId');
  var answer=String(fd.get('answer')||'').trim();
  var agentId=fd.get('agentId')||'';
  if(!answer){toast('اكتب الإجابة أولًا','err');return}
  var g=(ws().kb_gaps||[]).find(function(x){return x.id===gapId});
  var title='تدريب: '+(g?g.q:'سؤال').slice(0,50);
  var content='س: '+(g?g.q:'')+'\nج: '+answer;
  closeModal();
  var ok=await processTextDoc(title,content,agentId);
  if(ok&&g){
    g.status='done';save();
    if(isRemote()&&ws().__wid){try{sbClient().from('kb_gaps').upsert({id:g.id,workspace_id:ws().__wid,data:g},{onConflict:'id'}).then(function(){}).catch(function(){});}catch(e2){}}
    toast('تم التدريب ✔ سيجيب الوكيل من هذه الإجابة الآن','ok');
    route();
  }
});

/* تحديث الواجهة بالنسخ الموسّعة */
if(typeof route==='function')route();
