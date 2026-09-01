/* ═══ fixes.js v5 — مزامنة لا تنكسر + تهيئة مرة واحدة ═══ */
(function(){

/* [1] مزامنة تتخطى أي جدول/عمود ناقص بدل إيقاف كل شيء */
window.pushTables=async function(c,wid,s){
  var T={agents:s.agents,widgets:s.widgets,knowledge_docs:s.kb,contacts:s.contacts,conversations:s.convos,invoices:s.invoices};
  for(var t in T){
    try{
      var d=await c.from(t).delete().eq('workspace_id',wid);
      if(d.error)console.warn('[fixes] تخطي حذف '+t+': '+d.error.message);
      else if(T[t]&&T[t].length){
        var r=await c.from(t).insert(T[t].map(function(x){return {id:x.id,workspace_id:wid,data:x}}));
        if(r.error)console.warn('[fixes] تخطي إدراج '+t+': '+r.error.message);
      }
    }catch(e){console.warn('[fixes] تخطي جدول '+t);}
  }
  try{await c.from('workspaces').update({name:s.settings.name,plan:s.plan,usage_ai:s.usage.ai}).eq('id',wid);}catch(e){}
  try{if(s.settings.onboarded===true)await c.from('workspaces').update({onboarded:true}).eq('id',wid);}catch(e){}
  return true;
};

/* [2] تحميل مساحة العمل حتى لو فشل التحميل الأصلي (يحل hasWs:false) */
var _lr=window.loadRemote;
window.loadRemote=async function(){
  var ok=false;
  try{ok=await _lr.apply(this,arguments);}catch(e){console.warn('[fixes] loadRemote:',e&&e.message);}
  if(!ok&&remoteUser){
    try{
      var c=sbClient();
      var q=await c.from('workspaces').select('*').eq('owner_id',remoteUser.id).maybeSingle();
      var row=q&&q.data;
      if(!row){
        var ins=await c.from('workspaces').insert({owner_id:remoteUser.id,name:'مساحة عملي'}).select().single();
        row=ins&&ins.data;
      }
      if(row){
        var prev=(db&&db.ws&&db.ws.settings)||null;
        db.ws={__wid:row.id,
          settings:{name:row.name||'مساحة عمل',type:row.type||'',lang:row.lang||'العربية',tz:row.tz||'Asia/Riyadh',team:row.team||[],
            onboarded:(row.onboarded===true)||(prev&&prev.onboarded===true),
            goals:(prev&&prev.goals)||[],channels:(prev&&prev.channels)||['widget'],
            onboardingStep:(prev&&prev.onboardingStep)||1,obStep:(prev&&prev.obStep)||1,obBuilt:!!(prev&&prev.obBuilt),
            onboardingAgentId:(prev&&prev.onboardingAgentId)||null,onboardingWidgetId:(prev&&prev.onboardingWidgetId)||null,
            obAgentId:(prev&&prev.obAgentId)||null,obWidgetId:(prev&&prev.obWidgetId)||null},
          plan:row.plan||'free',usage:{ai:row.usage_ai||0},
          agents:[],widgets:[],kb:[],contacts:[],convos:[],invoices:[],
          credits_balance:row.credits_balance!=null?row.credits_balance:20,
          credits_used:row.credits_used||0,
          credit_history:(db&&db.ws&&db.ws.credit_history)||[]};
        var tabs=[['agents','agents'],['widgets','widgets'],['knowledge_docs','kb'],['contacts','contacts'],['conversations','convos'],['invoices','invoices']];
        for(var i=0;i<tabs.length;i++){
          try{var r=await c.from(tabs[i][0]).select('data').eq('workspace_id',row.id);
          db.ws[tabs[i][1]]=(r.data||[]).map(function(x){return x.data});}catch(e){}
        }
        persist();ok=true;
      }
    }catch(e){console.warn('[fixes] fallback failed:',e&&e.message);}
  }
  if(ok){remoteBroken=false;}
  return ok;
};

/* [3] كل حفظ → تثبيت onboarded على الخادم */
var _save=window.save;
window.save=function(){
  _save.apply(this,arguments);
  try{
    if(isRemote()&&db&&db.ws&&db.ws.__wid&&db.ws.settings&&db.ws.settings.onboarded===true){
      sbClient().from('workspaces').update({onboarded:true}).eq('id',db.ws.__wid).then(function(){}).catch(function(){});
    }
  }catch(e){}
};

/* [4] دخول اللوحة = تهيئة مكتملة */
var _go=window.go;
window.go=function(h){
  if(h==='#/app'&&db&&db.ws&&db.ws.settings&&db.ws.settings.onboarded!==true){
    db.ws.settings.onboarded=true;persist();
    try{if(isRemote()&&db.ws.__wid)sbClient().from('workspaces').update({onboarded:true}).eq('id',db.ws.__wid).then(function(){}).catch(function(){});}catch(e){}
  }
  return _go.apply(this,arguments);
};

/* [5] نوافذ منبثقة سليمة */
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
