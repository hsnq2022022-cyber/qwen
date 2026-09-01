/* ═══ fixes.js (نسخة v2 — لا تعتمد على pushTables) ═══ */
(function(){

/* ── [أ] عند كل حفظ محلي: أرسل onboarded للخادم فوراً ── */
var _save=window.save;
window.save=function(){
  _save.apply(this,arguments);
  /* بعد الحفظ: إذا كنا متصلين وعلينا onboarded=true → ادفعها للخادم الآن */
  try{
    if(isRemote()&&!remoteBroken&&db&&db.ws&&db.ws.__wid&&db.ws.settings.onboarded===true){
      sbClient().from('workspaces')
        .update({onboarded:true})
        .eq('id',db.ws.__wid)
        .then(function(){}).catch(function(){});
    }
  }catch(e){}
};

/* ── [ب] عند تسجيل الدخول: اقرأ onboarded من الخادم ── */
var _loadRemote=window.loadRemote;
window.loadRemote=async function(){
  var ok=await _loadRemote.apply(this,arguments);
  if(ok&&db&&db.ws&&db.ws.__wid){
    try{
      var r=await sbClient().from('workspaces')
        .select('onboarded, credits_balance, credits_used')
        .eq('id',db.ws.__wid).maybeSingle();
      if(r.data){
        if(r.data.onboarded===true){db.ws.settings.onboarded=true;}
        if(typeof r.data.credits_balance==='number')db.ws.credits_balance=r.data.credits_balance;
        if(typeof r.data.credits_used==='number')db.ws.credits_used=r.data.credits_used;
        persist();
      }
    }catch(e){console.warn('loadRemote extras failed',e);}
  }
  return ok;
};

/* ── [ج] إصلاح النوافذ المنبثقة: أزرار الحفظ تعمل داخلها ── */
var _modal=window.modal;
window.modal=function(html){
  document.getElementById('modal-root').innerHTML=
  '<div class="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4" data-action="modal-close">'+
  '<div class="modal-inner glass rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto p-6 fadeUp shadow-soft">'+
  html+'</div></div>';
};
document.addEventListener('click',function(e){
  var root=document.getElementById('modal-root');
  if(!root||!root.contains(e.target))return;
  var inner=e.target.closest('.modal-inner');
  if(!inner)return;
  var act=e.target.closest('[data-action]');
  if(act&&inner.contains(act))return; /* زر له إجراء → يمر طبيعياً */
  e.stopPropagation(); /* نقرة عادية داخل النافذة → لا تُغلقها */
},true);

/* ── [د] عند إكمال المعالج: اجعل onboarded=true قبل الخروج ── */
var _go=window.go;
window.go=function(h){
  if(h==='#/app'&&db&&db.ws&&db.ws.settings&&db.ws.settings.onboarded!==true){
    db.ws.settings.onboarded=true;
    /* ننادي save الجديد الذي سيدفع onboarded للخادم */
    if(typeof save==='function')save();
  }
  return _go.apply(this,arguments);
};

})();
