const {test}=require('node:test'),a=require('node:assert/strict'),V=require('../assets/engine.js'),{verify}=require('../scripts/verify-score.cjs');
test('legacy saves retain Easy rules; difficulty increases pressure and Expert removes hints',()=>{
 const states=['easy','normal','hard','expert'].map(d=>V.create(7,'valley-7','ranked',d));
 const legacy=JSON.parse(JSON.stringify(states[0]));delete legacy.difficulty;a.deepEqual(V.network(legacy),V.network(states[0]));
 for(let i=1;i<states.length;i++){a.ok(V.forecast(states[i]).demand[0]>V.forecast(states[i-1]).demand[0]);a.ok(V.quote(states[i],'upgrade',0).cost>=V.quote(states[i-1],'upgrade',0).cost);a.ok(V.goal(states[i])>=V.goal(states[i-1]));}
 a.equal(states[3].crew,3);a.equal(V.rules(states[3]).hints,false);states[2].pmDay=1;states[3].pmDay=1;states[2].day=2;states[3].day=2;a.ok(V.fresh(states[2]));a.equal(V.fresh(states[3]),false);
});
test('longest Expert campaign has a legal winning replay, verified with its own rules',()=>{
 const fixture=require('./expert-winning-replay.json'),s=V.create(fixture.chapter,fixture.seed,fixture.mode,fixture.difficulty);
 for(const [type,id,value] of fixture.moves){if(type==='end')V.settle(s);else a.ok(V.act(s,type,id,value).ok,`${type} day ${s.day}`);a.ok(s.credits>=0);a.ok(s.ap>=0);}
 a.ok(s.won);a.equal(s.history.length,14);const r=verify({version:3,...fixture},'QA',0,'');a.equal(r.score,s.score);a.equal(r.difficulty,'expert');a.throws(()=>verify({version:3,...fixture,difficulty:'__proto__'},'QA',0,''),/difficulty/);
});
test('rApps do useful work only with appropriate capacity, data and intent',()=>{
 const s=V.create(5,'policy');s.sites.forEach(x=>{x.o1=true;x.health=100;x.level=2;x.locked=false;x.drift=false});s.policy='balanced';
 const active=V.network(s);a.ok(active.sleeping.length>0);const without=V.network({...s,apps:[]});a.ok(active.energyCost<without.energyCost);
 const stale=V.network({...s,pmDay:0});a.equal(stale.appsReady,false);a.equal(stale.sleeping.length,0);
 s.policy='capacity';s.sites[1].level=1;s.sites[1].health=60;const balanced=V.network(s);const manual=V.network({...s,apps:['energy']});a.ok(balanced.service>manual.service);a.ok(balanced.transfers.length>0);
});

test('new Expert neglect fails by day four across varied starts and replays verify',()=>{
 const patterns=new Set();
 for(let i=0;i<100;i++){
  const seed='valley-1-v4-'+i.toString(16).padStart(16,'0'),s=V.create(1,seed,'ranked','expert'),moves=[];
  patterns.add(JSON.stringify({sites:s.sites,weather:Array.from({length:7},(_,day)=>V.forecast(s,day+1))}));
  a.equal(V.neglectLoss(s),18);while(!s.ended){moves.push(['end']);V.settle(s);}
  a.equal(s.won,false);a.equal(s.day,4);a.equal(s.trust,0);
  a.equal(verify({version:3,chapter:1,seed,mode:'ranked',difficulty:'expert',moves},'QA',0,'').score,s.score);
 }
 a.equal(patterns.size,100);
 a.throws(()=>verify({version:3,chapter:2,seed:'valley-1-v4-0000000000000000',mode:'ranked',moves:[]},'QA',0,''),/seed/);
});
test('shared new-season seeds reproduce faults and incident forecasts exactly',()=>{
 const seed='valley-4-v4-1234567890abcdef',s=V.create(4,seed,'ranked','expert'),friend=V.create(4,seed,'challenge','expert');
 a.deepEqual(s.sites,friend.sites);
 for(let day=1;day<=s.days;day++)a.deepEqual(V.forecast(s,day),V.forecast(friend,day));
 const legacy=V.create(1,'valley-1','ranked','expert');a.equal(V.neglectLoss(legacy),12);
});
