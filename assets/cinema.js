'use strict';
window.ValleyCinema = (() => {
  const scenes={
    o1:{title:'A connection comes alive',tag:'O1 MANAGEMENT',steps:['Authenticate','Establish session','FM · PM · CM available'],color:'#8ef1e0'},
    data:{title:'The valley tells its story',tag:'O1 → SMO DATA → R1',steps:['Gather telemetry','Build the dataset','Make data available'],color:'#91caff'},
    config:{title:'A careful change',tag:'O1 CONFIGURATION',steps:['Validate configuration','Apply the change','Verify the result'],color:'#f6d889'},
    repair:{title:'Help is on the way',tag:'FIELD CREW',steps:['Dispatch crew','Repair the hardware','Restore service'],color:'#ffd394'},
    build:{title:'Room to grow',tag:'VALLEY WORKSHOP',steps:['Deliver materials','Build the upgrade','Ready for tomorrow'],color:'#c7ec9b'},
    rapp:{title:'A new guardian for the valley',tag:'NON-RT RIC · rAPP DEPLOYMENT',steps:['Register rApp','Connect R1 services','Activate control loop'],color:'#bea9ff'},
    policy:{title:'One valley. One direction.',tag:'NON-RT RIC COORDINATION',steps:['Resolve priorities','Coordinate rApps','Update A1 policy intent'],color:'#efb9ff'},
    night:{title:'The valley carries on',tag:'END OF DAY',steps:['Serve the community','Measure the outcome','A new day begins'],color:'#ffd889'},
    win:{title:'You kept the valley connected',tag:'SEASON COMPLETE',steps:['Lights across the water','A promise kept','The valley celebrates'],color:'#ffe79a'}
  };
  async function play(type, detail='') {
    if(NR.read('cinematics',true)===false)return;
    const spec=scenes[type]||scenes.build,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const previous=document.activeElement;
    const d=document.createElement('dialog');d.className='cinema';d.setAttribute('aria-label',spec.title);
    d.innerHTML=`<div class="cinema-world"></div><canvas aria-hidden="true"></canvas><div class="cinema-vignette"></div><div class="cinema-caption"><div class="eyebrow">${spec.tag}</div><h2>${spec.title}</h2><p>${NR.escape(detail)}</p><div class="cinema-steps">${spec.steps.map((x,i)=>`<span data-phase="${i}">${x}</span>`).join('')}</div><div class="cinema-progress"><i></i></div></div><button class="cinema-skip" autofocus>${reduced?'Continue':'Skip animation'} <span>Esc</span></button>`;
    document.body.append(d);d.showModal();
    const canvas=d.querySelector('canvas'),ctx=canvas.getContext('2d');let raf,closed=false,start=performance.now();
    return new Promise(resolve=>{
      function done(){if(closed)return;closed=true;cancelAnimationFrame(raf);d.close();d.remove();if(previous?.isConnected)previous.focus({preventScroll:true});resolve();}
      d.querySelector('button').onclick=done;d.addEventListener('cancel',e=>{e.preventDefault();done();});
      const duration=reduced?900:4200;
      function draw(now){
        if(closed)return;
        const t=Math.min(1,(now-start)/duration),phase=Math.min(2,Math.floor(t*3));
        d.querySelectorAll('[data-phase]').forEach((el,i)=>el.classList.toggle('active',i<=phase));d.querySelector('.cinema-progress i').style.width=(t*100)+'%';
        const w=innerWidth,h=innerHeight,scale=Math.min(devicePixelRatio||1,2);if(canvas.width!==w*scale||canvas.height!==h*scale){canvas.width=w*scale;canvas.height=h*scale;}ctx.setTransform(scale,0,0,scale,0,0);ctx.clearRect(0,0,w,h);
        const cx=w*.5,cy=h*.40,spread=Math.min(w*.32,360),nodes=[[-spread,-50],[spread,-50],[0,100]];
        const color=spec.color;ctx.strokeStyle=color;ctx.fillStyle=color;
        // Network paths grow outwards, then carry luminous packets into the valley.
        nodes.forEach(([nx,ny],j)=>{
          const p=Math.min(1,t*3);ctx.globalAlpha=.6;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+nx*p,cy+ny*p);ctx.stroke();
          for(let k=0;k<4;k++){const a=reduced?.5:(t*2+k/4+j*.07)%1;ctx.globalAlpha=.8;ctx.shadowColor=color;ctx.shadowBlur=18;ctx.beginPath();ctx.arc(cx+nx*a,cy+ny*a,4,0,Math.PI*2);ctx.fill();}
          ctx.shadowBlur=0;
          if(type==='build'||type==='repair'){
            const lift=reduced?0:Math.max(0,1-t*2)*80;ctx.save();ctx.translate(cx+nx,cy+ny-lift);ctx.globalAlpha=Math.min(1,t*3);
            ctx.fillStyle='#163c46';ctx.fillRect(-28,-28,56,58);ctx.strokeRect(-28,-28,56,58);ctx.fillStyle=color;
            for(let r=0;r<3;r++)for(let c=0;c<3;c++)if(t>(r*3+c)/16)ctx.fillRect(-18+c*14,-18+r*15,7,8);
            ctx.restore();
          }else{
            ctx.globalAlpha=1;ctx.fillStyle='#10343d';ctx.beginPath();ctx.arc(cx+nx,cy+ny,24,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.font='20px system-ui';ctx.textAlign='center';ctx.fillText(t>.7?'✓':j===2?'⌂':'⌁',cx+nx,cy+ny+7);
          }
        });
        ctx.globalAlpha=1;ctx.shadowColor=color;ctx.shadowBlur=30;ctx.fillStyle='#12343f';ctx.beginPath();ctx.arc(cx,cy,49,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 15px system-ui';ctx.fillText(type==='rapp'?'rApp':type==='policy'?'A1':type==='o1'?'O1':type==='data'?'R1':type==='night'?'☾':'✦',cx,cy+5);
        if(!reduced){for(let j=0;j<3;j++){const p=(t*2+j/3)%1;ctx.globalAlpha=(1-p)*.45;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,50+p*140,0,Math.PI*2);ctx.stroke();}}
        if(type==='win'||(type==='night'&&t>.65)){for(let i=0;i<65;i++){const a=i*2.399,p=(t*1.8+i*.031)%1;ctx.globalAlpha=1-p;ctx.fillStyle=['#ffe9a1','#92efd7','#e4afff'][i%3];ctx.fillRect(cx+Math.cos(a)*p*spread,cy+Math.sin(a)*p*180,4,5);}}
        ctx.globalAlpha=1;
        if(t>=1)done();else raf=requestAnimationFrame(draw);
      }
      raf=requestAnimationFrame(draw);
    });
  }
  return {play};
})();
