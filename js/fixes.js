/* ═══ fixes.js v4 — مضاد للأعطال: تهيئة مرة واحدة + مزامنة لا تنكسر ═══ */
(function(){

/* [1] إنشاء مساحة العمل: إذا فشلت الطريقة الكاملة، أنشئها بالحد الأدنى */
var _prov=window.provisionRemote;
window.provisionRemote=async function(c){
  try{ return await _prov.apply(this,arguments); }
  catch(e){
    console.warn('[fixes] إعادة إنشاء مساحة العمل بالحد الأدنى:',e&&e.message);
    var r=await c.from('workspaces').insert({owner_id:remoteUser.id,name:'مساحة عملي'}).select().single();
    if(r.error)throw r.error;
    return r.data;
  }
};

/* [2] المزامنة: إذا فشلت الكاملة (أعمدة ناقصة)،زامن الجداول الأساسية فقط */
var _pt=window.pushTables;
window.pushTables=async function(c,wid,s){
  try{ return await _pt.apply(this,arguments); }
  catch(e){
    console.warn('[fixes] مزامنة مبسّطة:',e&&e.message);
    var T={agents:s.agents,widgets:s.widgets,knowledge_docs:s.kb,contacts:s.contacts,conversations:s.convos,invoices:s.invoices};
    for(var t in T){
      await c.from(t).delete().eq('workspace_id',wid);
      if(T[t]&&T[t].length){
        var r=await c.from(t).insert(T[t].map(function(x){return {id:x.id,workspace_id:wid,data:x}}));
        if(r.error)throw r.error;
      }
    }
    await c.from('workspaces').update({name:s.settings.name,plan:s.plan}).eq('id',wid);
  }
};

/* [3] كل حفظ → ادفع onboarded للخادم (ينهي تكرار المعالج) */
var _save=window.save;
window.save=function(){
  _save.apply(this,arguments);
  try{
    if(isRemote()&&!remoteBroken&&db&&db.ws&&db.ws.__wid&&db.ws.settings&&db.ws.settings.onboarded===true){
      sbClient().from('workspaces').update({onboarded:true}).eq('id',db.ws.__wid).then(function(){}).catch(function(){});
    }
  }catch(e){}
};

/* [4] عند الدخول: اقرأ الحالة من الخادم قبل التوجيه */
var _lr=window.loadRemote;
window.loadRemote=async function(){
  var ok=await _lr.apply(this,arguments);
  if(ok&&db&&db.ws&&db.ws.__wid){
    try{
      var r=await sbClient().from('workspaces').select('onboarded,credits_balance,credits_used').eq('id',db.ws.__wid).maybeSingle();
      if(r.data){
        if(r.data.onboarded===true)db.ws.settings.onboarded=true;
        if(typeof r.data.credits_balance==='number')db.ws.credits_balance=r.data.credits_balance;
        if(typeof r.data.credits_used==='number')db.ws.credits_used=r.data.credits_used;
        persist();
      }
    }catch(e){}
  }
  return ok;
};

/* [5] شبكة أمان: دخول اللوحة = تهيئة مكتملة */
var _go=window.go;
window.go=function(h){
  if(h==='#/app'&&db&&db.ws&&db.ws.settings&&db.ws.settings.onboarded!==true){
    db.ws.settings.onboarded=true;persist();
    try{if(isRemote()&&db.ws.__wid)sbClient().from('workspaces').update({onboarded:true}).eq('id',db.ws.__wid).then(function(){}).catch(function(){});}catch(e){}
  }
  return _go.apply(this,arguments);
};

/* [6] نوافذ منبثقة سليمة */
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
