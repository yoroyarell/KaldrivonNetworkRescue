'use strict';
const V=require('../assets/engine.js');
const types=new Set(['connect','inspect','repair','upgrade','harden','stage','apply','rollback','pm','r1','install','uninstall','policy','parts','crew','compute']);
function verify(payload,login,issue,date){
 if(!payload||payload.version!==3||!Number.isInteger(payload.chapter)||payload.chapter<1||payload.chapter>7||typeof payload.seed!=='string'||payload.seed.length>50||!['ranked','weekly','challenge'].includes(payload.mode)||!Array.isArray(payload.moves)||payload.moves.length>400)throw Error('Invalid replay format.');
 if(payload.mode==='ranked'&&payload.seed!=='valley-'+payload.chapter)throw Error('Ranked seed does not match its chapter.');
 if(payload.mode==='weekly'&&(!/^\d{4}-\d{2}-\d{2}$/.test(payload.seed)||1+V.hash(payload.seed)%7!==payload.chapter))throw Error('Invalid weekly challenge.');
 const s=V.create(payload.chapter,payload.seed,payload.mode);
 for(const move of payload.moves){
  if(s.ended)throw Error('Replay contains moves after the season ended.');
  if(!Array.isArray(move)||move.length>3)throw Error('Invalid move.');
  const [type,id,value]=move;
  if(type==='end'){V.settle(s);continue;}
  if(!types.has(type))throw Error('Unknown action.');
  if(id!==null&&id!==undefined&&!(Number.isInteger(id)&&id>=0&&id<=2)&&!['balance','energy','heal'].includes(id))throw Error('Invalid target.');
  if(value!==null&&value!==undefined&&!['normal','boost','eco','balanced','capacity'].includes(value))throw Error('Invalid value.');
  const out=V.act(s,type,id===null?undefined:id,value===null?undefined:value);if(!out.ok)throw Error('Illegal move: '+out.reason);
 }
 if(!s.ended)throw Error('The replay is not a completed season.');
 return {mission:s.chapter,name:login,score:s.score,won:s.won,mode:s.mode,seed:s.seed,days:s.history.length,average:Math.round(s.history.reduce((a,r)=>a+r.service,0)/s.history.length),trust:s.trust,credits:s.credits,date,issue};
}
module.exports={verify};
