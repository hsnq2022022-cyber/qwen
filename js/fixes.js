/* ═══ fixes.js v3 — إصلاح نهائي: التهيئة مرة واحدة + مزامنة سليمة ═══ */
(function(){

/* [1] كل حفظ محلي → ادفع onboarded للخادم فورًا */
var _save=window.save;
window.save=function(){
  _save.apply(this,arguments);
  try{
    if(isRemote()&&!remoteBroken&&db&&db.ws&&db.ws.__wid&&db.ws.settings&&db.ws.settings.onboarded===true){
      sbClient().from('workspaces').update({onboarded:true}).eq('id',db.ws.__wid)
        .then(function(){}).catch(function(){});
    }
  }catch(e){}
};

/* [2] عند تسجيل الدخول: اقرأ الحالة من الخادم قَبْل قرار التوجيه */
var _loadRemote=window.loadRemote;
window.loadRemote=async function(){
  var ok=await _loadRemote.apply(this,arguments);
  if(ok&&db&&db.ws&&db.ws.__wid){
    try{
      var r=await sbClient().from('workspaces')
        .select('onboarded,credits_balance,credits_used')
        .eq('id',db.ws.__wid).maybeSingle();
      if(r.data){
        if(r.data.onboarded===true)db.ws.settings.onboarded=true;
        if(typeof r.data.credits_balance==='number')db.ws.credits_balance=r.data.credits_balance;
        if(typeof r.data.credits_used==='number')db.ws.credits_used=r.data.credits_used;
        persist();
      }
    }catch(e){console.warn('[fixes] تعذر قراءة حالة الخادم:',e);}
  }
  return ok;
};

/* [3] شبكة أمان: دخول لوحة التحكم = تهيئة مكتملة */
var _go=window.go;
window.go=function(h){
  if(h==='#/app'&&db&&db.ws&&db.ws.settings&&db.ws.settings.onboarded!==true){
    db.ws.settings.onboarded=true;persist();
    try{
      if(isRemote()&&db.ws.__wid)
        sbClient().from('workspaces').update({onboarded:true}).eq('id',db.ws.__wid)
          .then(function(){}).catch(function(){});
    }catch(e){}
  }
  return _go.apply(this,arguments);
};

/* [4] نوافذ منبثقة سليمة: الأزرار الداخلية تعمل ولا تُغلق بالنقر داخلها */
window.modal=function(html){
  document.getElementById('modal-root').innerHTML=
  '<div class="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4" data-action="modal-close">'+
  '<div class="modal-inner glass rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto p-6 fadeUp shadow-soft">'+html+'</div></div>';
};
document.addEventListener('click',function(e){
  var root=document.getElementById('modal-root');
  if(!root||!root.contains(e.target))return;
  var inner=e.target.closest('.modal-inner');
  if(!inner)return;
  var act=e.target.closest('[data-action]');
  if(act&&inner.contains(act))return;
  e.stopPropagation();
},true);

})();
