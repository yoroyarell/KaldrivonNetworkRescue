'use strict';
const fs=require('node:fs'),cp=require('node:child_process');
(async()=>{
 const api='https://kaldrivon-valley-scores.decoricepaper.chatgpt.site/api/scores';
 const scores=[];let offset=0;
 do{const response=await fetch(api+'?offset='+offset,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Score service unavailable; retaining existing backup.');const page=await response.json();if(page.version!==3||!Array.isArray(page.scores))throw Error('Invalid score response.');for(const s of page.scores){if(!Number.isInteger(s.score)||s.score<0||s.score>1000||typeof s.name!=='string')throw Error('Invalid score row.');scores.push(s);}if(page.next===null)break;if(!Number.isInteger(page.next)||page.next<=offset)throw Error('Invalid pagination.');offset=page.next;}while(offset<=1000000);
 const path='data/scoreboard.json',old=JSON.parse(fs.readFileSync(path,'utf8'));if(JSON.stringify(old.scores)===JSON.stringify(scores)){console.log('Scoreboard backup is current.');return;}
 fs.writeFileSync(path,JSON.stringify({version:3,updated:new Date().toISOString(),scores},null,2)+'\n');
 cp.execFileSync('git',['config','user.name','github-actions[bot]']);cp.execFileSync('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);cp.execFileSync('git',['add','--',path]);cp.execFileSync('git',['commit','-m','Back up verified valley scoreboard']);cp.execFileSync('git',['push','origin','HEAD:main'],{stdio:'inherit'});
})().catch(e=>{console.error(e.message);process.exitCode=1;});
