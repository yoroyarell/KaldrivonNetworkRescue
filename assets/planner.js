/* Read-only daily planning. Every option points to an existing, replay-verified action. */
(function(root){
 'use strict';
 const copy=s=>JSON.parse(JSON.stringify(s));
 function plan(s,V){
  if(s.ended)return null;
  const today=V.network(s),after=copy(s),report=V.settle(after),tomorrow=after.ended?null:V.network(after);
  const urgent=[],options=[];
  const add=(list,title,text,tab,site,action,id,value)=>list.push({title,text,tab,site,action,id,value});
  const legal=(action,id,value)=>V.quote(s,action,id,value).ok;
  const route=(i)=>{const x=s.sites[i];return !x.o1?'connect':!x.inspected?'inspect':x.staged?'apply':'stage';};
  for(let i=0;i<3;i++){
   const x=s.sites[i],p=V.places[i];
   if(x.locked||x.drift||!x.o1){
    const action=route(i);
    add(urgent,x.locked?`${p.short}: restore radio service`:x.drift?`${p.short}: correct CM drift`:`${p.short}: restore O1`,!x.o1?'Management is offline. Restore visibility before telemetry or remote configuration.':`${x.locked?'Radio is locked.':'Configuration differs from baseline.'} Read O1, stage a change and check its service preview.`,'district',i,action,i,action==='stage'?'normal':undefined);
   }
  }
  if(s.apps.length&&!today.appsReady&&!urgent.some(x=>x.action==='connect')){
   add(urgent,'Reactivate your rApps',!s.r1?'R1 registration is missing. Restore the SMO data service.':'PM data is stale. Collect a dataset to resume optimization today and tomorrow.','ric',undefined,!s.r1?'r1':'pm');
  }
  const next=tomorrow?V.forecast(after):null;
  if(next?.storm&&!s.sites[next.target].hardened){
   add(urgent,`Protect ${V.places[next.target].short} before tomorrow`,'Storm damage will remove 35 health and disconnect O1. Stormproofing costs 40 credits and one part, reducing damage to 8.','district',next.target,'harden',next.target);
  }
  if(report.service<V.chapters[s.chapter-1].goal&&!urgent.length){
   const i=today.served.map((n,i)=>V.forecast(s).demand[i]-n).indexOf(Math.max(...today.served.map((n,i)=>V.forecast(s).demand[i]-n)));
   add(urgent,'Improve today’s service',`Today is projected at ${report.service}%, below the ${V.chapters[s.chapter-1].goal}% season target. Compare expansion, repair, CM power or Flow Weaver before committing.`,'district',i,'upgrade',i);
  }
  if(s.ap){
   // Optional work must have a measurable benefit and be affordable.
   for(let i=0;i<3;i++)if(s.sites[i].health<100&&legal('repair',i)){
    const t=copy(s);V.act(t,'repair',i);const n=V.network(t);
    add(options,`Maintain ${V.places[i].short}`,`Aya’s field crew: ${s.sites[i].health}% → 100% health; capacity ${today.capacity[i]} → ${n.capacity[i]}. Costs 18 credits, one part and one action.`,'district',i,'repair',i);
   }
   if(next&&tomorrow.service<95){
    const demand=next.demand.map((n,i)=>n-tomorrow.served[i]);const i=demand.indexOf(Math.max(...demand));
    if(legal('upgrade',i)){
     const t=copy(s),q=V.quote(s,'upgrade',i);V.act(t,'upgrade',i);V.settle(t);
     add(options,`Prepare ${V.places[i].short} for day ${after.day}`,`Tomorrow’s projected service: ${tomorrow.service}% → ${V.network(t).service}% with expansion. Costs ${q.cost} credits and one part; adds 2 credits/day in energy.`,'district',i,'upgrade',i);
    }
   }
   if(today.appsReady&&s.apps.includes('energy'))for(const policy of ['balanced','eco'])if(legal('policy',undefined,policy)){
    const t=copy(s);V.act(t,'policy',undefined,policy);const n=V.network(t);
    if(n.service>=95&&n.energyCost<today.energyCost)add(options,'Coordinate an energy-saving day',`Theo’s policy comparison: ${s.policy} → ${policy}, service ${today.service}% → ${n.service}%, energy ${today.energyCost} → ${n.energyCost} credits/day. Costs one action.`,'ric',undefined,'policy',undefined,policy);
   }
   for(let i=0;i<3;i++){
    const x=s.sites[i];if(!x.o1||x.locked||x.drift||x.power==='eco')continue;
    const t=copy(s);t.sites[i].power='eco';const n=V.network(t);
    if(n.service>=95&&n.energyCost<today.energyCost&&s.credits>=8){
     const action=!x.inspected?'inspect':x.staged?.power==='eco'?'apply':'stage';
     add(options,`Tune ${V.places[i].short} for efficiency`,`Mira’s efficiency request: Eco power keeps ${n.service}% service today and changes energy ${today.energyCost} → ${n.energyCost} credits/day. CM costs 8 credits and one action. Lower capacity may need reversing for busy days.`,'district',i,action,i,action==='stage'?'eco':undefined);
    }
   }
   for(const id of ['balance','energy','heal'])if(legal('install',id)){
    const t=copy(s);V.act(t,'install',id);const n=V.network(t);
    if(n.service>today.service||n.net>today.net||(id==='heal'&&s.sites.some(x=>x.drift||x.locked)))add(options,`Try ${V.apps[id].name}`,`Deploy through R1: service ${today.service}% → ${n.service}%, operating balance ${today.net} → ${n.net} credits/day. Purchase ${V.apps[id].price} credits; upkeep 3/day.`,'ric',undefined,'install',id);
   }
   if(s.apps.length&&V.fresh(s)&&s.pmDay!==s.day&&next&&!V.fresh(after)&&legal('pm'))add(options,'Keep automation ready tomorrow','Tomorrow your PM data expires. Collect now for 5 credits and one action, or reserve tomorrow’s crew for a fresh dataset.','ric',undefined,'pm');
  }
  const ready=!urgent.length&&report.service>=V.chapters[s.chapter-1].goal&&after.credits>=0;
  const title=!s.ap?'Crew shift complete':ready?'Everything is stable. Advance when ready.':'Before you close today';
  const text=!s.ap?'Your actions are used. Review the outcome and tomorrow’s conditions.':ready?'Optional improvements are available below. Saving credits and advancing is a valid choice; unused actions do not carry over.':'Choose what to fix or prepare. You can still advance, but check the consequences in the day review.';
  const kinds=new Set(),distinct=options.filter(h=>{
   const kind=['inspect','stage','apply','policy'].includes(h.action)?'efficiency':h.action==='install'?'automation':h.action;
   if(kinds.has(kind))return false;kinds.add(kind);return true;
  });
  return {ready,title,text,urgent,options:distinct.slice(0,3),today:{service:report.service,net:report.net},tomorrow:next?{day:after.day,label:next.label,service:tomorrow.service,data:V.fresh(after)?'fresh':'stale',credits:after.credits}:null};
 }
 const api={plan};root.ValleyPlanner=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
