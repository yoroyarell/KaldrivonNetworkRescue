/* Kaldrivon Valley: deterministic, turn-based game rules. No network control. */
(function (root) {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hash = s => Array.from(String(s)).reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 7);
  const chapters = [
    {id:1,map:'city.webp',cityName:'Kaldrivon Valley',title:'A valley wakes',icon:'🌱',days:7,goal:85,credits:210,story:'Mira’s market opens in a week. Restore the valley and keep its first festival connected.',lesson:'O1, repairs & capacity'},
    {id:2,map:'city.webp',cityName:'Kaldrivon Valley',title:'Market days',icon:'🏮',days:10,goal:88,credits:190,story:'The market is growing. Extra radio power helps today, but a balancing rApp can help every day.',lesson:'PM data & load balancing'},
    {id:3,map:'city.webp',cityName:'Kaldrivon Valley',title:'The green valley',icon:'🌿',days:10,goal:88,credits:150,story:'A small treasury, a rising electricity bill. Decide when your valley can afford to sleep.',lesson:'Energy versus coverage'},
    {id:4,map:'city.webp',cityName:'Kaldrivon Valley',title:'Storm season',icon:'🌧',days:12,goal:88,credits:190,story:'Storms follow the river. Harden vulnerable sites before the weather turns.',lesson:'Resilience & field crews'},
    {id:5,map:'city.webp',cityName:'Kaldrivon Valley',title:'Two voices',icon:'⚖',days:12,goal:90,credits:180,story:'Energy and capacity apps want different things. Give your Non-RT RIC a clear priority.',lesson:'rApp conflict coordination'},
    {id:6,map:'city.webp',cityName:'Kaldrivon Valley',title:'The invisible valley',icon:'🔭',days:14,goal:90,credits:180,story:'Traffic still flows, but your O1 management connections are down. Restore visibility before automating.',lesson:'Management is not service'},
    {id:7,map:'city.webp',cityName:'Kaldrivon Valley',title:'The grand festival',icon:'🎆',days:14,goal:92,credits:170,story:'The entire valley is counting on you. Build a network that can weather storms and the final festival.',lesson:'The complete SMO challenge'}
  ];
  const difficulties={
    easy:{id:'easy',name:'Easy',credits:1,crew:4,parts:3,demand:0,growth:2.2,festival:0,prices:1,energy:1,income:1,stormEvery:0,auditEvery:5,damage:35,protectedDamage:8,pmAge:1,goal:0,minTrust:35,startTrust:70,hints:true,description:'Original rules. Four actions, generous resources and two-day PM freshness.'},
    normal:{id:'normal',name:'Normal',credits:.9,crew:4,parts:3,demand:6,growth:2.6,festival:4,prices:1.05,energy:1.05,income:1,stormEvery:6,auditEvery:5,damage:37,protectedDamage:8,pmAge:1,goal:2,minTrust:40,startTrust:70,hints:true,description:'Busier districts, a tighter budget and extra storms. Plan before spending.'},
    hard:{id:'hard',name:'Hard',credits:.85,crew:4,parts:2,demand:12,growth:3.2,festival:9,prices:1.15,energy:1.12,income:1,stormEvery:5,auditEvery:4,damage:40,protectedDamage:10,pmAge:1,goal:3,minTrust:45,startTrust:65,hints:true,description:'Faster demand growth, costly repairs and frequent audits. Automation and reserves matter.'},
    expert:{id:'expert',name:'Expert',credits:.85,crew:3,parts:2,demand:16,growth:3.6,festival:14,prices:1.25,energy:1.2,income:1,stormEvery:5,auditEvery:3,damage:42,protectedDamage:12,pmAge:0,goal:4,minTrust:50,startTrust:65,hints:false,description:'Three actions, same-day PM only, frequent storms and audits. Hints are locked off.'}
  };
  const rules=s=>Object.hasOwn(difficulties,s.difficulty)?difficulties[s.difficulty]:difficulties.easy;
  const goal=s=>Math.min(96,chapters[s.chapter-1].goal+rules(s).goal);
  const minTrust=s=>rules(s).minTrust;
  const places = [
    {name:'Willow Village',short:'Willow',icon:'🏡',x:22,y:34,base:63,person:'Mira',wish:'Keep the village connected. The market is our livelihood.'},
    {name:'Lantern Market',short:'Market',icon:'🏮',x:76,y:29,base:75,person:'Theo',wish:'Festival visitors need capacity. Check the forecast before we open.'},
    {name:'Harbor Quarter',short:'Harbor',icon:'⛵',x:76,y:73,base:57,person:'Aya',wish:'Storms hit our waterfront. A resilient site is worth the investment.'}
  ];
  const apps = {
    balance:{name:'Flow Weaver',icon:'⇄',price:65,data:2,description:'Moves up to 35 unmet traffic units into spare capacity at other districts. Needs fresh O1 PM data from all three sites.'},
    energy:{name:'Night Gardener',icon:'☾',price:50,data:1,description:'Saves 7 credits per eligible site each day. Reduces its capacity by 25. Eco policy sleeps every site; balanced policy sleeps only sites with 25 spare capacity.'},
    heal:{name:'Watchkeeper',icon:'✚',price:60,data:2,description:'Automatically clears configuration drift and unlocks connected sites at day end. Cannot mend damaged hardware or restore O1.'}
  };
  const varied=s=>/-v4-[a-f0-9]{16}$/.test(s.seed);
  const neglectLoss=s=>varied(s)&&rules(s).id==='expert'?18:12;
  function forecast(s, day=s.day) {
    const d=rules(s),roll=hash(s.seed+':'+day), storm=day>2 && (varied(s)?(day===3+hash(s.seed+':first-storm')%3 || roll%({easy:6,normal:5,hard:4,expert:3}[d.id])===0):(day%4===0 || (s.chapter>=4 && day%5===0) || (d.stormEvery&&day%d.stormEvery===0)));
    const festival=day===s.days || (varied(s)?day>1&&hash(s.seed+':festival:'+day)%4===0:day%3===0);
    const demand=places.map((p,i)=>p.base + d.demand + Math.floor((day-1)*d.growth) + (hash(s.seed+':'+day+':'+i)%13-6) + (festival?(i===1?48+d.festival:15+d.festival):0));
    return {day,storm,festival,target:roll%3,demand,label:storm?'River storm':festival?'Lantern festival':'City day',icon:storm?'🌧':festival?'🏮':'☀',energy:storm?1.25:1};
  }
  function create(chapter=1,seed='valley',mode='ranked',difficulty='easy') {
    const c=chapters[clamp(chapter,1,7)-1],d=Object.hasOwn(difficulties,difficulty)?difficulties[difficulty]:difficulties.easy;
    const s={version:3,difficulty:d.id,chapter:c.id,seed:String(seed),mode,day:1,days:c.days,credits:Math.round(c.credits*d.credits),parts:d.parts,trust:d.startTrust,ap:d.crew,crew:d.crew,slots:2,samples:0,pmDay:0,apps:[],policy:'balanced',r1:true,sites:places.map((p,i)=>({id:i,level:1,health:100,o1:true,locked:false,drift:false,power:'normal',hardened:false,inspected:false,staged:null})),history:[],log:[],contracts:[],ended:false,won:false,turns:0};
    if(c.id===1){s.sites[0].locked=true;s.sites[0].o1=false;s.sites[2].health=65;}
    if(c.id===2){s.sites[1].drift=true;s.sites[2].o1=false;}
    if(c.id===3){s.sites[0].health=80;s.samples=1;}
    if(c.id===4){s.sites[2].health=55;s.sites[1].o1=false;}
    if(c.id===5){s.apps=['energy','balance'];s.samples=2;s.pmDay=1;s.policy='eco';}
    if(c.id===6){s.sites.forEach(x=>x.o1=false);s.r1=false;}
    if(c.id===7){s.sites[0].locked=true;s.sites[2].health=60;s.sites[1].o1=false;}
    if(varied(s)){
      // Shuffle district starting faults without changing the chapter's resource budget.
      const order=[0,1,2];
      for(let i=2;i>0;i--){const j=hash(s.seed+':start:'+i)%(i+1);[order[i],order[j]]=[order[j],order[i]];}
      const initial=s.sites;s.sites=order.map((source,id)=>({...initial[source],id}));
    }
    return s;
  }
  const fresh=s=>s.pmDay>0&&s.day-s.pmDay<=rules(s).pmAge;
  function network(s,f=forecast(s)) {
    const energy=s.apps.includes('energy'), balance=s.apps.includes('balance');
    const appsReady=s.r1&&fresh(s)&&s.sites.every(x=>x.o1);
    const sleeping=[];
    let capacity=s.sites.map((x,i)=> {
      if(x.locked)return 0;
      let n=(95+(x.level-1)*35+(x.power==='boost'?25:x.power==='eco'?-20:0))*(x.health/100)*(x.drift?.62:1);
      if(energy && appsReady && s.policy!=='capacity' && (s.policy==='eco'||n-f.demand[i]>=25)){n-=25;sleeping.push(i);}
      return Math.max(0,Math.floor(n));
    });
    let served=capacity.map((n,i)=>Math.min(n,f.demand[i]));
    let transfers=[];
    if(balance && appsReady){
      let spare=capacity.map((n,i)=>Math.max(0,n-f.demand[i]));
      let budget=s.policy==='eco'&&energy?12:35;
      for(let i=0;i<3;i++)for(let j=0;j<3;j++){
        // An unlocked radio must exist at the destination; balancing cannot fix an outage.
        if(i===j||s.sites[i].locked||s.sites[i].health<=0)continue;
        const n=Math.min(f.demand[i]-served[i],spare[j],budget);
        if(n>0){served[i]+=n;spare[j]-=n;budget-=n;transfers.push({from:j,to:i,units:n});}
      }
    }
    const service=Math.round(100*served.reduce((a,b)=>a+b,0)/f.demand.reduce((a,b)=>a+b,0));
    const energyCost=Math.max(5,Math.round(s.sites.reduce((a,x)=>a+(x.locked?3:9+x.level*2+(x.power==='boost'?6:x.power==='eco'?-4:0)),0)*f.energy*rules(s).energy)-sleeping.length*7);
    const income=Math.round((28+service*.65)*rules(s).income),upkeep=s.apps.length*3;
    return {capacity,served,service,energyCost,income,upkeep,net:income-energyCost-upkeep,sleeping,transfers,appsReady,conflict:energy&&balance&&s.policy==='eco'};
  }
  function quote(s,type,id,value) {
    const x=s.sites[id]; let cost=0,parts=0,ap=1,reason='';
    const siteActions=['connect','inspect','repair','upgrade','harden','stage','apply','rollback'];
    if(s.ended)reason='This season is finished.';
    else if(siteActions.includes(type)&&!x)reason='Select a district.';
    else switch(type){
      case 'inspect':ap=0;if(!x.o1)reason='Restore O1 first to read FM and CM.';break;
      case 'connect':cost=12;if(x.o1)reason='O1 is already connected.';break;
      case 'repair':cost=18;parts=1;if(x.health===100)reason='Hardware is already healthy.';break;
      case 'upgrade':cost=65+(x.level-1)*25;parts=1;if(x.level>=3)reason='Maximum capacity upgrade reached.';break;
      case 'harden':cost=40;parts=1;if(x.hardened)reason='This site is already stormproof.';break;
      case 'stage':
        ap=0;if(!x.o1)reason='O1 must be connected for CM.';
        else if(!x.inspected)reason='Read the O1 report first.';
        else if(!['normal','boost','eco'].includes(value))reason='Choose a valid configuration.';
        else if(!x.locked&&!x.drift&&x.power===value)reason='This configuration is already active.';
        break;
      case 'apply':cost=8;if(!x.o1)reason='O1 is disconnected.';else if(!x.staged)reason='Stage a CM change first.';break;
      case 'rollback':cost=8;if(!x.o1)reason='O1 is disconnected.';else if(!x.previous)reason='No previous configuration exists.';break;
      case 'pm':cost=5;if(!s.sites.every(x=>x.o1))reason='Connect O1 at all three districts first.';else if(s.pmDay===s.day)reason='PM already collected today.';break;
      case 'r1':cost=15;if(s.r1)reason='The R1 data service is already registered.';break;
      case 'install':cost=apps[id]?.price||0;
        if(!apps[id])reason='Unknown rApp.';
        else if(s.apps.includes(id))reason='Already installed.';
        else if(!s.r1)reason='Register the R1 data service first.';
        else if(!fresh(s)||!s.sites.every(x=>x.o1))reason='Collect fresh PM data with all O1 links connected.';
        else if(s.samples<apps[id].data)reason=`Needs ${apps[id].data} PM datasets. Collect once per day.`;
        else if(s.apps.length>=s.slots)reason='No free Non-RT RIC slots. Expand compute or uninstall an app.';break;
      case 'uninstall':cost=0;if(!s.apps.includes(id))reason='Not installed.';break;
      case 'policy':if(!['balanced','capacity','eco'].includes(value))reason='Unknown policy.';else if(s.policy===value)reason='This policy is active.';break;
      case 'parts':cost=30;ap=0;break;
      case 'crew':cost=100;if(s.crew>=6)reason='Crew is fully trained.';break;
      case 'compute':cost=90;if(s.slots>=3)reason='All three compute slots unlocked.';break;
      case 'r1break':reason='Unavailable.';break;
      default:reason='Unknown action.';
    }
    cost=Math.ceil(cost*rules(s).prices);
    if(!reason&&s.ap<ap)reason='No crew actions left. Open the day review to continue.';
    if(!reason&&s.credits<cost)reason=`Needs ${cost} credits; you have ${s.credits}.`;
    if(!reason&&s.parts<parts)reason='Needs one spare part. Buy a crate at the workshop.';
    return {ok:!reason,reason,cost,parts,ap};
  }
  function act(s,type,id,value) {
    const q=quote(s,type,id,value);if(!q.ok)return q;
    s.credits-=q.cost;s.parts-=q.parts;s.ap-=q.ap;s.turns++;
    const x=s.sites[id];let message='',scene=null;
    switch(type){
      case 'inspect':x.inspected=true;message='O1 report received: FM alarms and current CM configuration.';break;
      case 'connect':x.o1=true;x.inspected=true;message='O1 restored. Management visibility is back; radio faults still need attention.';scene='o1';break;
      case 'repair':x.health=100;message='Field crew restored hardware health to 100%.';scene='repair';break;
      case 'upgrade':x.level++;message='Permanent capacity increased by 35 units.';scene='build';break;
      case 'harden':x.hardened=true;message=`Storm protection installed. Future storm damage falls from ${rules(s).damage} to ${rules(s).protectedDamage}.`;scene='build';break;
      case 'stage':x.staged={power:value};message='CM change staged. Review the predicted result, then apply.';break;
      case 'apply':x.previous={power:x.power,locked:x.locked,drift:x.drift};x.power=x.staged.power;x.locked=false;x.drift=false;x.staged=null;message='Validated CM applied over O1. Site unlocked and configuration drift cleared.';scene='config';break;
      case 'rollback':Object.assign(x,x.previous);x.previous=null;x.staged=null;message='Previous CM restored. Check whether old alarms returned.';scene='config';break;
      case 'pm':s.samples++;s.pmDay=s.day;message=`One PM dataset collected. rApp data is fresh ${rules(s).pmAge?'for today and tomorrow':'for today only'}.`;scene='data';break;
      case 'r1':s.r1=true;message='SMO data services are available to rApps through R1.';scene='data';break;
      case 'install':s.apps.push(id);message=apps[id].name+' deployed to the Non-RT RIC.';scene='rapp';break;
      case 'uninstall':s.apps=s.apps.filter(a=>a!==id);message='rApp removed. Compute slot released. No purchase refund.';break;
      case 'policy':s.policy=value;message='Non-RT RIC priority updated. Review the service and energy trade-off.';scene='policy';break;
      case 'parts':s.parts+=3;message='Three spare parts delivered.';break;
      case 'crew':s.crew++;s.ap++;message='Crew trained. One extra action today and every following day.';scene='build';break;
      case 'compute':s.slots++;message='Third Non-RT RIC slot is ready.';scene='build';break;
    }
    s.log.unshift({day:s.day,message});s.log=s.log.slice(0,30);
    return {ok:true,message,scene};
  }
  function previewChange(s,id) {const t=JSON.parse(JSON.stringify(s)),x=t.sites[id];if(x.staged){x.power=x.staged.power;x.locked=false;x.drift=false;}return network(t);}
  function settle(s) {
    if(s.ended)return null;
    const f=forecast(s),notes=[];
    if(s.apps.includes('heal')&&s.r1&&fresh(s))s.sites.forEach((x,i)=>{if(x.o1&&(x.locked||x.drift)){x.locked=false;x.drift=false;notes.push('Watchkeeper corrected '+places[i].short+'.');}});
    const n=network(s,f),trustDelta=n.service>=95?5:n.service>=85?2:n.service>=70?-5:-neglectLoss(s);
    s.credits+=n.net;s.trust=clamp(s.trust+trustDelta,0,100);
    let grant=0;const awards=[];
    if(n.service>=95&&!s.contracts.includes('first')){s.contracts.push('first');grant+=30;awards.push('Connected community: +30 credits');}
    if(f.festival&&n.service>=95&&!s.contracts.includes('festival')){s.contracts.push('festival');grant+=45;awards.push('Festival promise: +45 credits');}
    if(n.sleeping.length>=2&&n.service>=95&&!s.contracts.includes('green')){s.contracts.push('green');grant+=40;awards.push('Green valley: +40 credits');}
    s.credits+=grant;
    const report={day:s.day,...n,trustDelta,grant,awards,notes,forecast:f};s.history.push(report);
    if(s.day===s.days||s.trust===0||s.credits<0){
      s.ended=true;const avg=s.history.reduce((a,r)=>a+r.service,0)/s.history.length;
      s.won=s.day===s.days&&avg>=goal(s)&&s.trust>=minTrust(s)&&s.credits>=0;
      s.score=clamp(Math.round(avg*6+s.trust*2+Math.min(100,Math.max(0,s.credits)/3)+s.contracts.length*30),0,s.won?1000:599);
      report.finished=true;return report;
    }
    s.day++;s.ap=s.crew;s.sites.forEach(x=>{x.inspected=false;x.staged=null;});
    const next=forecast(s);
    if(next.storm){const x=s.sites[next.target];x.health=Math.max(0,x.health-(x.hardened?rules(s).protectedDamage:rules(s).damage));if(!x.hardened)x.o1=false;notes.push(`Storm reached ${places[next.target].short}: ${x.hardened?rules(s).protectedDamage:rules(s).damage} health lost${x.hardened?'':'; O1 disconnected'}.`);}
    if(varied(s)?s.day>=3&&(hash(s.seed+':audit:'+s.day)%rules(s).auditEvery===0 || s.day===3+hash(s.seed+':first-audit')%rules(s).auditEvery):s.day%rules(s).auditEvery===0){const i=hash(s.seed+':drift:'+s.day)%3;s.sites[i].drift=true;notes.push('Configuration audit due: '+places[i].short+' has drift. Read its O1 report.');}
    if(s.chapter>=6&&s.day===7){s.r1=false;notes.push('R1 service registration expired. Re-register it in the Non-RT RIC.');}
    return report;
  }
  root.Valley={chapters,difficulties,rules,goal,minTrust,places,apps,create,forecast,network,quote,act,settle,previewChange,fresh,hash,neglectLoss,varied};
  if(typeof module!=='undefined')module.exports=root.Valley;
})(typeof window!=='undefined'?window:globalThis);
