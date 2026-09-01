/* ═══ fixes.js — إصلاحات نهائية بدون تعديل main.js ═══ */
(function(){

/* 1) مزامنة حالة onboarded مع الخادم → ينتهي تكرار المعالج كل دخول */
var _pushTables=window.pushTables;
window.pushTables=async function(c,wid,s){
  var r=await _pushTables.apply(this,arguments);
  try{await c.from('workspaces').update({onboarded:(s.settings.onboarded===true)}).eq('id',wid);}catch(e){}
  return r;};
var _loadRemote=window.loadRemote;
window.loadRemote=async function(){
  var ok=await _loadRemote.apply(this,arguments);
  if(ok&&db&&db.ws&&db.ws.__wid){
    try{
      var r=await sbClient().from('workspaces').select('onboarded').eq('id',db.ws.__wid).maybeSingle();
      if(r.data&&r.data.onboarded===true&&db.ws.settings.onboarded!==true){db.ws.settings.onboarded=true;persist();}
    }catch(e){}
  }
  return ok;};

/* 2) نوافذ منبثقة سليمة: لا تُغلق عند النقر داخلها، وتعمل كل أزرارها (حفظ Agent وغيره) */
var _modal=window.modal;
window.modal=function(html){
  document.getElementById('modal-root').innerHTML=
  '<div class="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4" data-action="modal-close">'+
  '<div class="modal-inner glass rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto p-6 fadeUp shadow-soft">'+html+'</div></div>';};
document.addEventListener('click',function(e){
  var root=document.getElementById('modal-root');
  if(!root||!root.contains(e.target))return;
  var inner=e.target.closest('.modal-inner');
  if(!inner)return;                      /* نقرة على الخلفية → تُغلق طبيعيًا */
  var act=e.target.closest('[data-action]');
  if(act&&inner.contains(act))return;    /* زر داخلي له إجراء → يمر للمعالج */
  e.stopPropagation();                   /* نقرة عادية داخل النافذة → لا تُغلق */
},true);

})();
