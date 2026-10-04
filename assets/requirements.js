(function(root){
'use strict';
const requirementIcons=[[/^Actions|New daily/,'◷'],[/^Credits/,'◈'],[/^Parts/,'⚙'],[/^Hardware/,'♡'],[/O1/,'⌁'],[/^Level/,'↑'],[/^Previous/,'↶'],[/^Configuration|CM/,'≋'],[/^R1/,'⇄'],[/^Trained crews/,'♧'],[/^Compute|Slots/,'▦'],[/rApp|installed/i,'✧'],[/^Different policy/,'⚖'],[/^Unprotected/,'⛨'],[/^Fresh PM/,'◌'],[/^Datasets/,'▤'],[/^Active season/,'☀']];
function icon(label){return requirementIcons.find(([pattern])=>pattern.test(label))?.[1]||'◇';}
function list(s,V,type,id,value){
 const q=V.quote(s,type,id,value),x=s.sites[id],items=[];
 const add=(label,met,help)=>items.push({label,met,help,icon:icon(label)});
 const lesson=root.ValleyTutorial?.current(s,V);if(lesson)add('Tutorial step',root.ValleyTutorial.matches(lesson,type,id,value),'Guided training allows only the highlighted lesson action. Finish that step, or choose Continue without guidance to unlock normal scored play.');
 if(q.ap)add(`Actions left ${s.ap} / needs ${q.ap}`,s.ap>=q.ap,'This is your remaining action budget today, not your trained crew count. Each task spends the shown number of actions. Review and finish today to refill your daily budget. Crew training also needs an available action.');
 if(q.cost)add(`Credits ${s.credits}/${q.cost}`,s.credits>=q.cost,'Purchase costs are paid immediately. Finish a day with positive operating income to earn credits; compare energy and upkeep before spending.');
 if(q.parts)add(`Parts ${s.parts}/${q.parts}`,s.parts>=q.parts,'Buy a spare-parts crate in Build. It supplies three parts and uses no crew action.');
 if(s.ended)add('Active season',false,'This season has finished. Start another chapter to take actions.');
 if(type==='repair'&&x)add('Hardware damage',x.health!==100,`Hardware health is ${x.health}%. Repair is available only when hardware health is below 100%; configuration faults need CM changes instead.`);
 if(type==='connect'&&x)add('O1 disconnected',!x.o1,'Restore O1 only when the selected district’s management link is offline. A connected link needs no restoration.');
 if(type==='upgrade'&&x)add(`Level ${x.level}/3`,x.level<3,'District capacity can be upgraded to level 3. This district is already at the limit when level 3 is shown.');
 if(['inspect','stage','rollback'].includes(type))add('O1 online',!!x?.o1,'Restore the selected district’s O1 connection before reading or changing its configuration.');
 if(type==='stage'&&x){add('O1 report read',x.inspected,'Read the O1 report first to inspect FM and CM.');add('Configuration change',!!(x.locked||x.drift||x.power!==value),'Choose a different power mode, or use a CM change to clear a radio lock or configuration drift. The active healthy configuration needs no reapplication.');}
 if(type==='rollback')add('Previous configuration',!!x?.previous,'Apply a CM change first to create a previous configuration that you can restore.');
 if(type==='r1')add('R1 unregistered',!s.r1,'The R1 data service needs registering only once. It is already available when this requirement is missing.');
 if(type==='crew')add(`Trained crews ${s.crew}/6`,s.crew<6,'This is your permanent daily capacity, not actions remaining today. Training is available below the six-crew limit and spends one available action to add one crew.');
 if(type==='compute')add(`Compute ${s.slots}/3`,s.slots<3,'Compute can be expanded to three slots, one for each available rApp.');
 if(type==='uninstall')add('rApp installed',s.apps.includes(id),'Only an installed rApp can be removed. Removal frees its compute slot and ends its daily upkeep.');
 if(type==='policy')add('Different policy',s.policy!==value,'The selected coordination policy is already active. Choose another policy to change priorities.');
 if(type==='harden'&&x)add('Unprotected site',!x.hardened,'Stormproofing is permanent for this season. A protected site cannot be stormproofed again; repair its remaining hardware damage separately.');
 if(type==='install'){
  const app=V.apps[id];
  if(!app){add('Known rApp',false,'Choose an available rApp from the list.');return items;}
  add('Not installed',!s.apps.includes(id),'Each rApp can be installed once. An installed rApp already runs automatically when its data requirements are met.');
  add('R1 service',s.r1,'Register R1 in the rApps panel to give apps access to SMO data services.');
  add(`O1 ${s.sites.filter(x=>x.o1).length}/3`,s.sites.every(x=>x.o1),'Restore O1 in every district. Energy and balancing need data from all three sites.');
  add('Fresh PM',V.fresh(s),'Collect O1 PM in the rApps panel after connecting all sites. Expert data lasts only today; other levels also cover tomorrow.');
  add(`Datasets ${s.samples}/${app.data}`,s.samples>=app.data,'Collect one PM dataset per day. Flow Weaver and Watchkeeper need two datasets collected on different days; Night Gardener needs one. Datasets are reusable.');
  add(`Slots ${s.slots-s.apps.length}/1`,s.apps.length<s.slots,'Each installed app occupies one compute slot. Remove an app or expand Non-RT RIC compute in Build.');
 }
 if(type==='pm'){add('All O1 links',s.sites.every(x=>x.o1),'Restore O1 in all three district panels before collecting PM.');add('New daily collection',s.pmDay!==s.day,'One PM collection per day. Finish today, then collect another dataset tomorrow.');}
 if(type==='apply'){add('O1 online',!!x?.o1,'Restore the selected district’s O1 connection first.');add('CM staged',!!x?.staged,'Read the O1 report, choose Normal, Boost or Eco, then apply the staged change.');}
 if(!q.ok&&items.every(item=>item.met))add('Action available',false,q.reason||'This action is currently unavailable.');
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
