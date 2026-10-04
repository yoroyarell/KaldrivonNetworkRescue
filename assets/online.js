'use strict';
NR.scoreAPI='https://kaldrivon-valley-scores.decoricepaper.chatgpt.site/api/scores';
NR.playerID=()=>{let id=NR.read('keeper-id',null);if(typeof id!=='string'||!/^[a-f0-9-]{36}$/.test(id)){id=crypto.randomUUID();NR.write('keeper-id',id);}return id;};
NR.pendingScores=()=>{const p=NR.read('pending-seasons',[]);return Array.isArray(p)?p:[];};
NR.sendScore=async payload=>{try{const r=await fetch(NR.scoreAPI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(12000)});if(!r.ok)return false;return (await r.json()).saved===true;}catch{return false;}};
NR.submitScore=async s=>{
 if(s.mode==='practice')return true;
 const payload={player:NR.playerID(),name:String(NR.read('player','Valley keeper')).slice(0,24),replay:{version:3,difficulty:s.difficulty||'easy',chapter:s.chapter,seed:s.seed,mode:s.mode,moves:s.moves}};
 const key=JSON.stringify(payload);let pending=NR.pendingScores();if(!pending.some(p=>JSON.stringify(p)===key)){pending.push(payload);NR.write('pending-seasons',pending.slice(-20));}
 const ok=await NR.sendScore(payload);if(ok)NR.write('pending-seasons',NR.pendingScores().filter(p=>JSON.stringify(p)!==key));return ok;
};
NR.retryScores=async()=>{for(const payload of NR.pendingScores()){if(await NR.sendScore(payload)){const key=JSON.stringify(payload);NR.write('pending-seasons',NR.pendingScores().filter(p=>JSON.stringify(p)!==key));}}};
window.addEventListener('online',()=>NR.retryScores());
// Retry only on page load or when connectivity returns; no background polling.
NR.retryScores();
