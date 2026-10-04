const {test}=require('node:test'),a=require('node:assert/strict');
const V=require('../assets/engine.js'),P=require('../assets/planner.js');
const clone=s=>JSON.parse(JSON.stringify(s));
test('planning forecasts match actual day-end and never mutate the save',()=>{
 for(let c=1;c<=7;c++)for(let day=1;day<=5;day++){
  const s=V.create(c,'planning-check');for(let d=1;d<day;d++)V.settle(s);
  const before=JSON.stringify(s),p=P.plan(s,V),actual=clone(s),r=V.settle(actual);
  a.equal(JSON.stringify(s),before);a.equal(p.today.service,r.service);
  if(!actual.ended){a.equal(p.tomorrow.service,V.network(actual).service);a.equal(p.tomorrow.credits,actual.credits);a.equal(p.tomorrow.data,V.fresh(actual)?'fresh':'stale');}
 }
});
test('quiet healthy day offers actual affordable energy choices and permission to advance',()=>{
 const s=V.create(1);s.sites.forEach(x=>{x.o1=true;x.locked=false;x.health=100;});s.pmDay=1;s.samples=2;
 const p=P.plan(s,V);a.equal(p.ready,true);a.match(p.title,/Everything is stable/);a.ok(p.options.some(x=>/efficiency/.test(x.title)));
 for(const h of p.options)a.equal(V.quote(s,h.action,h.id,h.value).ok,true,h.title);
});
test('storm warning and expiring PM are visible before advancing',()=>{
 const s=V.create(5);s.day=3;s.pmDay=2;
 const p=P.plan(s,V);a.ok(p.urgent.some(h=>h.action==='harden'));a.equal(p.tomorrow.data,'stale');
});
test('no-action and final-day states are explicit without inventing a next day',()=>{
 const s=V.create(1);s.ap=0;a.equal(P.plan(s,V).options.length,0);a.match(P.plan(s,V).title,/Crew shift complete/);
 s.day=s.days;a.equal(P.plan(s,V).tomorrow,null);
});
