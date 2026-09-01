/* ═══ merge-pages.js — دمج صفحتي الوكلاء والودجات في صفحة واحدة ═══ */
(function(){

/* 1) تعديل القائمة الجانبية: حذف المنفصلتين وإضافة الموحّدة */
if(window.NAV){
  for(var i=NAV.length-1;i>=0;i--){if(NAV[i][0]==='agents'||NAV[i][0]==='widgets')NAV.splice(i,1);}
  var idx=-1;for(var j=0;j<NAV.length;j++){if(NAV[j][0]==='conversations'){idx=j;break;}}
  NAV.splice(idx+1,0,['studio','الوكلاء والودجات','bot']);
}
if(window.PAGES)PAGES['studio']='studio';

/* 2) الصفحة الموحّدة: كل وكيل + ودجاته في بطاقة واحدة */
function mergedPage(){
  var w=ws();
  var shared=w.kb.filter(function(k){return !k.agentId}).length;
  var cards=w.agents.map(function(a){
    var kbs=w.kb.filter(function(k){return k.agentId===a.id}).length;
    var wgs=w.widgets.filter(function(x){return x.agentId===a.id});
    var wHtml=wgs.map(function(x){
      return '<div class="bg-ink-900/60 border border-ink-800 rounded-xl p-4">'
      +'<div class="flex items-center gap-3"><span class="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-none" style="background:'+(x.primary||'#0ABAB5')+'">'+icon('widget','w-4 h-4')+'</span>'
      +'<div class="flex-1 min-w-0"><b class="text-sm">'+esc(x.name)+'</b><div class="text-[10px] text-ink-500 mt-0.5">'+(x.enabled?'● نشط':'● معطل')+' • توكن: <span class="ltr">'+esc(String(x.token).slice(0,8))+'…</span></div></div>'
      +'<button data-action="w-toggle" data-id="'+x.id+'" class="switch'+(x.enabled?' on':'')+'" title="تفعيل/تعطيل"></button></div>'
      +'<div class="flex flex-wrap gap-2 mt-3"><button data-action="open-builder" data-id="'+x.id+'" class="btn-ghost !py-1.5 text-xs">تخصيص ومعاينة</button><button data-action="embed" data-id="'+x.id+'" class="btn-ghost !py-1.5 text-xs">كود التضمين</button><button data-action="go" data-to="#/test?wid='+x.id+'" class="btn-ghost !py-1.5 text-xs">اختبار حي</button><button data-action="del-widget" data-id="'+x.id+'" class="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg">'+icon('trash','w-3.5 h-3.5')+'</button></div></div>';
    }).join('');
    return '<div class="glass rounded-2xl p-6">'
    +'<div class="flex items-start gap-3 mb-4"><img src="'+(a.avatar||AVT[0])+'" class="w-12 h-12 rounded-xl object-cover border border-ink-700" alt="" onerror="this.style.display=\'none\'">'
    +'<div class="flex-1 min-w-0"><h3 class="font-display font-bold">'+esc(a.name)+'</h3><p class="text-[11px] text-ink-500 mt-0.5">'+esc(a.model)+' • '+kbs+' مصدر خاص + '+shared+' مشترك</p></div>'
    +'<button data-action="edit-agent" data-id="'+a.id+'" class="p-2 text-ink-400 hover:text-white hover:bg-ink-800 rounded-lg" title="تعديل الوكيل">'+icon('edit','w-4 h-4')+'</button>'
    +'<button data-action="del-agent" data-id="'+a.id+'" class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" title="حذف الوكيل">'+icon('trash','w-4 h-4')+'</button></div>'
    +'<div class="space-y-3">'+(wHtml||'<div class="text-xs text-ink-500 bg-ink-900/40 border border-ink-800 rounded-xl p-4">لا ودجات مرتبطة بهذا الوكيل بعد.</div>')+'</div>'
    +'<button data-action="new-widget-for" data-id="'+a.id+'" class="btn-ghost w-full !py-2 text-xs mt-3">'+icon('plus','w-3.5 h-3.5')+' إضافة ويدجت لهذا الوكيل</button>'
    +'</div>';
  }).join('');
  return '<div class="flex items-center justify-between mb-5 flex-wrap gap-3"><div><h2 class="font-display font-bold text-xl">الوكلاء والودجات</h2><p class="text-xs text-ink-500 mt-1">كل وكيل (العقل والمعرفة) مع ودجاته (قنوات النشر) في مكان واحد.</p></div>'
  +'<div class="flex gap-2"><button data-action="new-agent" class="btn-primary">'+icon('plus','w-4 h-4')+' وكيل جديد</button></div></div>'
  +'<div class="grid lg:grid-cols-2 gap-4">'+(cards||'<div class="lg:col-span-2 glass rounded-2xl p-14 text-center text-ink-500">لا وكلاء بعد — أنشئ أول وكيل.</div>')+'</div>';
}

/* 3) اعتراض الراوتر: الروابط القديمة والجديدة تفتح الصفحة الموحّدة */
var _renderDash=window.renderDash;
window.renderDash=function(h){
  var seg=(h.split('?')[0].match(/#\/app\/?([\w-]*)/)||[,''])[1];
  if(seg==='studio'||seg==='agents'||seg==='widgets'){
    if(!me()){go('#/login');return;}
    dashShell('studio',mergedPage(),'الوكلاء والودجات');
    return;
  }
  return _renderDash(h);
};

/* 4) إنشاء ويدجت مرتبط مباشرة بوكيل معيّن */
document.addEventListener('click',function(e){
  var t=e.target&&e.target.closest?e.target.closest('[data-action]'):null;if(!t)return;
  if(t.dataset.action!=='new-widget-for')return;
  var aid=t.dataset.id;
  var ag=ws().agents.find(function(a){return a.id===aid});
  var name=prompt('اسم الويدجت الجديد:','ويدجت '+((ag&&ag.name)||''));
  if(!name)return;
  var nw=defWidget(aid,name);
  ws().widgets.push(nw);persist();
  if(isRemote()){
    syncWidgetToServer(nw).then(function(){toast('تم إنشاء الويدجت وحفظه ✔','ok');save();route();})
    .catch(function(err){nw.__unsynced=true;toast('أُنشئ محليًا وفشلت المزامنة: '+err.message,'err');save();route();});
  }else{save();toast('تم إنشاء الويدجت ✔','ok');route();}
});

if(typeof route==='function')route();
})();
