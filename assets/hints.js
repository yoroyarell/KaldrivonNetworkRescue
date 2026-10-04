/* Suggestions use the same quotes and forecasts as the action buttons. */
(function(root){
  'use strict';
  function suggest(s,V,lesson){
    if(s.ended)return null;
    if(lesson)return {text:lesson.text,tab:lesson.tab,site:lesson.site,action:lesson.action,id:lesson.id,value:lesson.value};
    if(root.ValleyPlanner){
      const p=root.ValleyPlanner.plan(s,V);
      if(!s.ap||p.ready)return {text:p.title+' '+p.text,action:'end'};
      const h=p.urgent[0];if(h)return {...h,text:h.text};
    }
    const candidate=(text,tab,action,id,value,site)=>V.quote(s,action,id,value).ok?{text,tab,action,id,value,site}:null;
    const end={text:'Open the day review to check service, income and trust. You can return to planning before committing.',action:'end'};
    if(!s.ap)return {...end,text:'Your crew has no actions left. Review today’s outcome, then open the next day to get fresh actions.'};
    for(let i=0;i<s.sites.length;i++){
      const x=s.sites[i],name=V.places[i].short;
      let hint;
      if(!x.o1)hint=candidate(`${name} has no O1 management link. Restore O1 to inspect faults and collect telemetry.`,'district','connect',i,undefined,i);
      else if(x.locked||x.drift){
        const action=!x.inspected?'inspect':x.staged?'apply':'stage';
        hint=candidate(`${name} has ${x.locked?'a locked radio':'configuration drift'}. ${action==='inspect'?'Read its O1 report.':action==='stage'?'Stage Normal, then check the preview.':'Apply the staged CM change after checking its preview.'}`,'district',action,i,action==='stage'?'normal':undefined,i);
      }
      if(hint)return hint;
    }
    const next=V.forecast(s,Math.min(s.days,s.day+1));
    if(next.storm&&!s.sites[next.target].hardened){const hint=candidate(`Tomorrow’s storm targets ${V.places[next.target].short}. Stormproof it now to reduce damage and keep O1 online.`,'district','harden',next.target,undefined,next.target);if(hint)return hint;}
    if(s.apps.length&&!V.fresh(s)){const hint=candidate('Your rApps have stale PM data. Collect O1 PM to reactivate optimization today and tomorrow.','ric','pm');if(hint)return hint;}
    if(!s.r1){const hint=candidate('Register the R1 data service so rApps can use SMO data.','ric','r1');if(hint)return hint;}
    for(let i=0;i<s.sites.length;i++)if(s.sites[i].health<80){const hint=candidate(`${V.places[i].short} has ${s.sites[i].health}% hardware health. A field repair restores capacity; service percentage is a separate measure.`,'district','repair',i,undefined,i);if(hint)return hint;}
    if(!s.parts){const hint=candidate('You have no spare parts. A crate supplies three parts for repairs, expansion or storm protection.','workshop','parts');if(hint)return hint;}
    if(V.network(s).conflict){const hint=candidate('Your rApps have conflicting Eco priorities. Try Balanced and compare service with the energy bill.','ric','policy',undefined,'balanced');if(hint)return hint;}
    if(!V.fresh(s)){const hint=candidate('Collect a PM dataset in the Non-RT RIC. Fresh telemetry lets you deploy and run rApps.','ric','pm');if(hint)return hint;}
    if(next.festival||V.network(s).service<V.chapters[s.chapter-1].goal){const hint=candidate('Capacity will help with busy days. Preview a permanent expansion at Lantern Market and keep enough credits for other work.','district','upgrade',1,undefined,1);if(hint)return hint;}
    return end;
  }
  const api={suggest};root.ValleyHints=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
