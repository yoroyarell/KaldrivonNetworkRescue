const {test}=require('node:test'),a=require('node:assert/strict'),V=require('../assets/engine.js'),R=require('../assets/requirements.js'),T=require('../assets/tutorial.js'),{verify}=require('../scripts/verify-score.cjs');
test('deployment exposes simultaneous blockers and becomes available after real requirements',()=>{
 const s=V.create(1,'valley-1');s.ap=0;s.credits=0;s.r1=false;s.slots=0;
 let req=R.list(s,V,'install','balance');a.equal(req.filter(x=>!x.met).length,7);a.ok(req.every(x=>x.help));
 s.ap=4;s.credits=500;s.r1=true;s.slots=2;s.sites.forEach(x=>x.o1=true);s.samples=2;s.pmDay=1;
 a.ok(R.list(s,V,'install','balance').every(x=>x.met));a.ok(V.quote(s,'install','balance').ok);a.ok(V.act(s,'install','balance').ok);
});
test('stormproof explains parts, credits, crew and existing protection separately',()=>{
 const s=V.create();s.ap=0;s.credits=0;s.parts=0;s.sites[0].hardened=true;
 a.equal(R.list(s,V,'harden',0).filter(x=>!x.met).length,4);
});
test('state blockers stay visible when all purchase resources are available',()=>{
 const s=V.create();s.credits=1000;s.parts=10;s.ap=6;
 const cases=[['repair',0],['connect',1],['upgrade',1],['rollback',1],['r1'],['crew'],['compute'],['uninstall','heal'],['policy',null,'balanced']];
 s.sites[0].health=100;s.sites[1].level=3;s.crew=6;s.slots=3;
 for(const [type,id,value] of cases){a.equal(V.quote(s,type,id,value).ok,false);const missing=R.list(s,V,type,id,value).filter(x=>!x.met);a.ok(missing.length,`${type} must explain why it is disabled`);a.ok(missing.every(x=>x.help));}
 const damage=R.list(s,V,'repair',0).find(x=>x.label==='Hardware damage');a.equal(damage.met,false);a.match(damage.help,/100%/);
 s.sites[0].health=65;a.ok(R.list(s,V,'repair',0).every(x=>x.met));a.ok(V.act(s,'repair',0).ok);a.equal(s.sites[0].health,100);a.equal(R.list(s,V,'repair',0).find(x=>x.label==='Hardware damage').met,false);
});
test('leaving training at every lesson preserves a server-verifiable scored replay',()=>{
 for(let exit=0;exit<T.lessons.length;exit++){
 const s=V.create(1,'valley-1','practice');s.tutorial={step:0};const moves=[];
 for(let i=0;i<exit;i++){const l=T.current(s,V);moves.push([l.action,l.id??null,l.value??null]);if(l.action==='end')V.settle(s);else a.ok(V.act(s,l.action,l.id,l.value).ok);s.tutorial.step++;}
 const day=s.day,credits=s.credits;T.leave(s);a.equal(s.mode,'ranked');a.equal(s.day,day);a.equal(s.credits,credits);a.equal(s.tutorial,undefined);
 while(!s.ended){V.settle(s);moves.push(['end']);}
 const record=verify({version:3,chapter:1,seed:'valley-1',mode:s.mode,difficulty:'easy',moves},'QA',0,'');a.equal(record.score,s.score);
 }
});
