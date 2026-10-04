(function(root){
'use strict';
function list(s,V,type,id,value){
 const q=V.quote(s,type,id,value),x=s.sites[id],items=[];
 const add=(label,met,help)=>items.push({label,met,help});
 if(q.ap)add(`Crew ${s.ap}/${q.ap}`,s.ap>=q.ap,'Crew actions reset each day. Review and finish today to replenish them. Train another crew in Build for a permanent extra action.');
 if(q.cost)add(`Credits ${s.credits}/${q.cost}`,s.credits>=q.cost,'Purchase costs are paid immediately. Finish a day with positive operating income to earn credits; compare energy and upkeep before spending.');
 if(q.parts)add(`Parts ${s.parts}/${q.parts}`,s.parts>=q.parts,'Buy a spare-parts crate in Build. It supplies three parts and uses no crew action.');
 if(type==='harden'&&x)add('Unprotected site',!x.hardened,'Stormproofing is permanent for this season. A protected site cannot be stormproofed again; repair its remaining hardware damage separately.');
 if(type==='install'){
  const app=V.apps[id];
  add('R1 service',s.r1,'Register R1 in the rApps panel to give apps access to SMO data services.');
  add(`O1 ${s.sites.filter(x=>x.o1).length}/3`,s.sites.every(x=>x.o1),'Restore O1 in every district. Energy and balancing need data from all three sites.');
  add('Fresh PM',V.fresh(s),'Collect O1 PM in the rApps panel after connecting all sites. Expert data lasts only today; other levels also cover tomorrow.');
  add(`Datasets ${s.samples}/${app.data}`,s.samples>=app.data,'Collect one PM dataset per day. Flow Weaver and Watchkeeper need two datasets collected on different days; Night Gardener needs one. Datasets are reusable.');
  add(`Slots ${s.slots-s.apps.length}/1`,s.apps.length<s.slots,'Each installed app occupies one compute slot. Remove an app or expand Non-RT RIC compute in Build.');
 }
 if(type==='pm'){add('All O1 links',s.sites.every(x=>x.o1),'Restore O1 in all three district panels before collecting PM.');add('New daily collection',s.pmDay!==s.day,'One PM collection per day. Finish today, then collect another dataset tomorrow.');}
 if(type==='apply'){add('O1 online',!!x?.o1,'Restore the selected district’s O1 connection first.');add('CM staged',!!x?.staged,'Read the O1 report, choose Normal, Boost or Eco, then apply the staged change.');}
 return items;
}
function benefit(s,V,id){
 const a=JSON.parse(JSON.stringify(s)),b=JSON.parse(JSON.stringify(s));a.apps=a.apps.filter(x=>x!==id);b.apps=[...new Set([...b.apps,id])];
 const off=V.settle(a),on=V.settle(b),ready=s.r1&&V.fresh(s)&&(id==='heal'||s.sites.every(x=>x.o1));
 if(!ready)return 'Paused with current data/connectivity. Meet the requirements below to activate it; installed apps still cost 3 credits/day.';
 if(id==='heal'){const fixes=on.notes.filter(x=>x.startsWith('Watchkeeper')).length;return fixes?`Today: clears ${fixes} configuration fault${fixes===1?'':'s'} without spending crew actions; service ${off.service}% → ${on.service}%.`:'No configuration fault to correct today. Watchkeeper handles future locks and audit drift automatically when PM and R1 are fresh and the affected site has O1. It saves manual CM actions, not hardware repairs.';}
 const moved=on.transfers.reduce((a,x)=>a+x.units,0);
 return `Today with this app: service ${off.service}% → ${on.service}%; energy ${off.energyCost} → ${on.energyCost} credits; daily net ${off.net} → ${on.net} (includes its 3-credit upkeep). `+(id==='balance'?(moved?`Balancing moves ${moved} traffic units into spare capacity.`:'No useful spare capacity to move today. Expand a donor district or use Boost; balancing cannot repair hardware or create capacity.'):(on.sleeping.length?`${on.sleeping.length} site(s) can sleep under ${s.policy} policy.`:'No site can sleep under this policy/demand. Balanced needs 25 spare capacity; Capacity prevents sleeping.'));
}
root.ValleyRequirements={list,benefit};if(typeof module!=='undefined')module.exports=root.ValleyRequirements;
})(typeof window!=='undefined'?window:globalThis);
