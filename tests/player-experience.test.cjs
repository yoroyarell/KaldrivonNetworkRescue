const {test}=require('node:test');
const a=require('node:assert/strict');
const V=require('../assets/engine.js'),T=require('../assets/tutorial.js'),H=require('../assets/hints.js'),S=require('../assets/sound.js');
const clone=x=>JSON.parse(JSON.stringify(x));
test('Harbor can serve all traffic while damaged; repair restores health and capacity',()=>{
 const s=V.create(1,'valley-1','practice');s.tutorial={step:3};
 const before=clone(s),n=V.network(s),demand=V.forecast(s).demand[2];
 a.equal(s.sites[2].health,65);a.equal(n.served[2],demand);a.equal(n.capacity[2],61);
 a.match(T.evidence(s,V,T.current(s,V)),/hardware health 65% · traffic served 100%/);
 a.ok(V.act(s,'repair',2).ok);a.equal(s.sites[2].health,100);a.equal(V.network(s).capacity[2],95);
 a.match(T.feedback(before,s,V,'repair',2,''),/65% → 100%; capacity 61 → 95/);
 s.sites[2].health=57;a.match(T.current(s,V).text,/57%/);
});
test('all 18 lessons display real measurements, lead to a valid hint and survive save/resume',()=>{
 let s=V.create(1,'valley-1','practice');s.tutorial={step:0};let eco,balanced;
 for(let i=0;i<18;i++){
  const l=T.current(s,V),h=H.suggest(s,V,l);
  a.ok(T.matches(l,h.action,h.id,h.value));a.ok(T.evidence(s,V,l).length>20);
  if(l.action==='end')V.settle(s);else a.ok(V.act(s,l.action,l.id,l.value).ok,`Lesson ${i+1}`);
  if(l.value==='eco')eco=V.network(s);if(l.value==='balanced')balanced=V.network(s);
  s.tutorial.step++;s=clone(s);
 }
 a.equal(s.day,4);a.equal(V.fresh(s),false);a.ok(eco.conflict);a.ok(balanced.service>eco.service);
 a.equal(s.sites[V.forecast(s).target].health,92);a.equal(s.sites[V.forecast(s).target].o1,true);
 a.equal(H.suggest(s,V,null).action,'pm');
 // Complete the independent shift using only suggested, affordable actions.
 let guard=0;
 while(!s.ended&&guard++<60){const h=H.suggest(s,V,null);if(h.action==='end')V.settle(s);else a.ok(V.act(s,h.action,h.id,h.value).ok);}
 a.equal(s.ended,true);a.equal(s.won,true);a.equal(s.history.length,7);a.equal(s.mode,'practice');
 a.equal(H.suggest(s,V,null),null);
});
test('task effects schedule audio; mute cancels pending resume and active notes',async()=>{
 let resume,starts=0,stops=0,context;
 class AudioContext{
  constructor(){context=this;this.state='suspended';this.currentTime=1;this.destination={};}
  resume(){return new Promise(resolve=>{resume=()=>{this.state='running';resolve();};});}
  createOscillator(){return {frequency:{setValueAtTime(){}},connect(){},disconnect(){},start(){starts++;},stop(){stops++;}};}
  createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
 }
 const audio=S.create(AudioContext),pending=audio.play('repair');audio.stop();resume();a.equal(await pending,false);a.equal(starts,0);
 a.equal(await audio.play('repair'),true);a.equal(starts,S.patterns.repair.length);const before=stops;audio.stop();a.equal(stops-before,S.patterns.repair.length);
 a.notDeepEqual(S.patterns.repair,S.patterns.pm);a.notDeepEqual(S.patterns.connect,S.patterns.install);
});
test('all campaigns use the original map, without chapter previews or water pedestrians',()=>{
 const fs=require('node:fs'),path=require('node:path');
 a.deepEqual([...new Set(V.chapters.map(c=>c.map))],['city.webp']);
 for(const c of V.chapters)a.equal(V.forecast(V.create(c.id)).label,'City day');
 const game=fs.readFileSync(path.join(__dirname,'../assets/game.js'),'utf8');
 const home=fs.readFileSync(path.join(__dirname,'../assets/home.js'),'utf8');
 a.ok(!home.includes('chapter-map'));
 a.match(game,/viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid slice"/);
 a.equal((game.match(/class="water-boat"/g)||[]).length,1);
 a.equal((game.match(/class="land-person"/g)||[]).length,2);
 a.equal((game.match(/class="land-bike"/g)||[]).length,2);
});
