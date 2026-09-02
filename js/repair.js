/* ═══ repair.js — إصلاح حاسم لنوافذ (حفظ الوكيل + رفع الملفات) ═══
   يُحمَّل آخر ملف. يستخدم فئة modal-box ومعرفات جديدة فلا تتعارض
   مع أي حماية قديمة، ويربط الأحداث مباشرة بالعناصر. */
(function(){

/* [1] نافذة منبثقة سليمة: النقرات تصل لأهدافها دائمًا */
window.modal=function(html){
  var rootEl=document.getElementById('modal-root');
  rootEl.innerHTML='<div class="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4" data-action="modal-close"><div class="modal-box glass rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto p-6 fadeUp shadow-soft">'+html+'</div></div>';
  var box=rootEl.querySelector('.modal-box');
  if(box)box.addEventListener('click',function(e){
    var act=e.target.closest('[data-action]');
    if(act&&box.contains(act))return;
    e.stopPropagation();
  });
};

/* [2] قائمة وكلاء محصّنة ضد undefined */
window.agentOptions=function(sel){
  var s=ws();var ag=(s&&s.agents)||[];
  return '<option value="">مشترك — كل الوكلاء</option>'+ag.map(function(a){return '<option value="'+a.id+'"'+(sel===a.id?' selected':'')+'>'+esc(a.name)+'</option>'}).join('');
};

/* [3] نافذة الوكيل: زر الحفظ يعمل فعليًا (ربط مباشر + حفظ محلي وخادمي) */
window.agentModal=function(id){
  var s=ws();s.agents=s.agents||[];
  var a=id?s.agents.find(function(x){return x.id===id}):null;
  var v=a||{name:'',desc:'',avatar:AV_LOCAL[0],instructions:'',language:'العربية',tone:'ودي واحترافي',model:'gemini-2.5-flash-lite',welcome:'أهلًا بك 👋',fallback:NO_INFO_MSG,sysprompt:'',rules:'',keywords:''};
  var avs=AV_LOCAL.map(function(u){return '<label class="cursor-pointer"><input type="radio" name="avatar" value="'+u+'" class="hidden peer" '+(v.avatar===u?'checked':'')+'><img src="'+u+'" class="w-12 h-12 rounded-xl object-cover border-2 peer-checked:border-tiffany-500 border-transparent"></label>'}).join('');
  modal('<h3 class="font-display font-bold text-lg mb-5">'+(a?'تعديل':'إنشاء')+' Agent</h3><form id="f-agent2" class="space-y-3">'
  +'<label class="lbl2">اسم الـ Agent *<input name="name" required class="inp-s" value="'+esc(v.name)+'"></label>'
  +'<label class="lbl2">الوصف<input name="desc" class="inp-s" value="'+esc(v.desc)+'"></label>'
  +'<div class="text-xs text-ink-400 mb-1">Avatar</div><div class="flex gap-2 mb-1">'+avs+'</div>'
  +'<label class="lbl2">التعليمات *<textarea name="instructions" required rows="3" class="inp-s">'+esc(v.instructions)+'</textarea></label>'
  +'<label class="lbl2">البرومبت المتقدم<textarea name="sysprompt" rows="2" class="inp-s">'+esc(v.sysprompt||'')+'</textarea></label>'
  +'<label class="lbl2">القواعد (سطر لكل قاعدة)<textarea name="rules" rows="3" class="inp-s">'+esc(v.rules||'')+'</textarea></label>'
  +'<label class="lbl2">كلمات مفتاحية (كلمة | رد) أو (كلمة | kb)<textarea name="keywords" rows="2" class="inp-s">'+esc(v.keywords||'')+'</textarea></label>'
  +'<div class="grid grid-cols-2 gap-3"><label class="lbl2">اللغة<select name="language" class="inp-s">'+['العربية','English','ثنائي اللغة'].map(function(l){return '<option '+(l===v.language?'selected':'')+'>'+l+'</option>'}).join('')+'</select></label><label class="lbl2">النبرة<select name="tone" class="inp-s">'+['ودي واحترافي','رسمي','مرح','هادئ ومتعاطف','خليجي ودود'].map(function(l){return '<option '+(l===v.tone?'selected':'')+'>'+l+'</option>'}).join('')+'</select></label></div>'
  +'<label class="lbl2">النموذج<select name="model" class="inp-s">'+AI_MODELS.map(function(l){return '<option '+(l===v.model?'selected':'')+'>'+l+'</option>'}).join('')+'</select></label>'
  +'<label class="lbl2">الترحيب<input name="welcome" class="inp-s" value="'+esc(v.welcome)+'"></label>'
  +'<label class="lbl2">رسالة عدم المعرفة<input name="fallback" class="inp-s" value="'+esc(v.fallback)+'"></label>'
  +'<div class="flex gap-2 pt-2"><button class="btn-primary flex-1">حفظ الـ Agent</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');
  document.getElementById('f-agent2').addEventListener('submit',function(e){
    e.preventDefault();e.stopPropagation();
    var data=Object.fromEntries(new FormData(e.target));
    var obj;
    if(id){obj=s.agents.find(function(x){return x.id===id});if(obj)Object.assign(obj,data);}
    else{obj=Object.assign({},data,{id:uid('ag_'),createdAt:now()});s.agents.push(obj);}
    persist();closeModal();
    if(isRemote()&&s.__wid){
      sbUpsert('agents',obj).then(function(){toast('تم حفظ الـ Agent في قاعدة البيانات ✔','ok');save();route();})
      .catch(function(err){toast('حُفظ محليًا: '+err.message,'err');save();route();});
    }else{save();toast('تم حفظ الـ Agent ✔','ok');route();}
  });
};

/* [4] إضافة مصدر: رفع ملف يعمل فعليًا (ضغط + سحب/إفلات) + نص + رابط */
window.kbTypeModalOpen=function(type){
  type=String(type||'').trim();
  if(type==='file'){
    modal('<h3 class="font-display font-bold mb-3">رفع ملف</h3><form id="f-kb-file2" class="space-y-3">'
    +'<div id="kb-drop2" class="rounded-xl border-2 border-dashed border-ink-600 hover:border-tiffany-500/60 transition p-6 text-center cursor-pointer"><div class="text-ink-400 text-sm">اسحب الملف هنا أو اضغط للاختيار</div><div class="text-[10px] text-ink-600 mt-1">PDF, DOCX, XLSX, CSV, TXT, MD</div><input id="kb-pick2" type="file" accept=".pdf,.txt,.docx,.csv,.xlsx,.xls,.md" class="hidden"></div>'
    +'<div id="kb-info2" class="hidden glass rounded-xl p-3 flex items-center justify-between text-xs"><span id="kb-name2" class="font-semibold"></span><span id="kb-size2" class="text-ink-500"></span></div>'
    +'<label class="lbl2">الـ Agent المرتبط<select id="kb-ag2" class="inp-s">'+agentOptions('')+'</select></label>'
    +'<div class="flex gap-2"><button class="btn-primary flex-1">رفع ومعالجة</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');
    var drop=document.getElementById('kb-drop2'),inp=document.getElementById('kb-pick2');
    function info(){var fl=inp.files[0];if(!fl)return;document.getElementById('kb-info2').classList.remove('hidden');document.getElementById('kb-name2').textContent=fl.name;document.getElementById('kb-size2').textContent=fmtSize(fl.size);}
    drop.addEventListener('click',function(){inp.click();});
    drop.addEventListener('dragover',function(e){e.preventDefault();});
    drop.addEventListener('drop',function(e){e.preventDefault();if(e.dataTransfer&&e.dataTransfer.files[0]){inp.files=e.dataTransfer.files;info();}});
    inp.addEventListener('change',info);
    document.getElementById('f-kb-file2').addEventListener('submit',function(e){
      e.preventDefault();e.stopPropagation();
      var fl=inp.files[0];
      if(!fl){toast('اضغط على المنطقة أعلاه واختر ملفًا أولًا','err');return;}
      var ag=document.getElementById('kb-ag2').value;
      closeModal();processFile(fl,ag);
    });
  }
  else if(type==='text'){
    modal('<h3 class="font-display font-bold mb-3">نص يدوي</h3><form id="f-kb-text2" class="space-y-3">'
    +'<label class="lbl2">العنوان (اختياري)<input name="title" class="inp-s" placeholder="مثال: أوقات العمل"></label>'
    +'<label class="lbl2">النص *<textarea name="content" rows="6" required class="inp-s"></textarea></label>'
    +'<label class="lbl2">الـ Agent المرتبط<select id="kb-ag2" class="inp-s">'+agentOptions('')+'</select></label>'
    +'<div class="flex gap-2"><button class="btn-primary flex-1">حفظ ومعالجة</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');
    document.getElementById('f-kb-text2').addEventListener('submit',function(e){
      e.preventDefault();e.stopPropagation();
      var fd=new FormData(e.target);
      var content=String(fd.get('content')||'').trim();
      if(!content){toast('اكتب النص أولًا','err');return;}
      var ag=document.getElementById('kb-ag2').value;
      closeModal();processTextDoc(String(fd.get('title')||'').trim(),content,ag);
    });
  }
  else if(type==='url'){
    modal('<h3 class="font-display font-bold mb-3">رابط موقع</h3><form id="f-kb-url2" class="space-y-3">'
    +'<label class="lbl2">الرابط *<input name="url" type="url" required class="inp-s ltr" placeholder="https://example.com"></label>'
    +'<div class="text-[10px] text-ink-500">يزحف حتى 10 صفحات، ومع المواقع المحمية يمر عبر مُصيّر Headless.</div>'
    +'<label class="lbl2">الـ Agent المرتبط<select id="kb-ag2" class="inp-s">'+agentOptions('')+'</select></label>'
    +'<div class="flex gap-2"><button class="btn-primary flex-1">إضافة ومزامنة</button><button type="button" data-action="modal-close" class="btn-ghost">إلغاء</button></div></form>');
    document.getElementById('f-kb-url2').addEventListener('submit',function(e){
      e.preventDefault();e.stopPropagation();
      var url=String(new FormData(e.target).get('url')||'').trim();
      if(!/^https?:\/\//i.test(url)){toast('الرابط يجب أن يبدأ بـ http أو https','err');return;}
      var ag=document.getElementById('kb-ag2').value;
      var d={id:uid('kb_'),name:url,type:'url',agentId:ag,content:'جارٍ الزحف...',status:'processing',chunks:[],chunkCount:0,createdAt:now(),error:''};
      ws().kb.unshift(d);save();refreshKbUI();closeModal();processUrl(url,d);
    });
  }
  else toast('نوع مصدر غير معروف','err');
};

})();
