/* Small, local Web Audio effects. No music downloads or autoplay. */
(function(root){
  'use strict';
  const patterns={
    click:[[640,.06]], inspect:[[440,.08],[660,.1]], stage:[[330,.08],[440,.12]],
    connect:[[330,.1],[495,.1],[660,.2]], pm:[[880,.06],[660,.06],[990,.06],[1320,.15]],
    apply:[[392,.08],[494,.08],[587,.2]], rollback:[[587,.08],[494,.08],[392,.2]],
    repair:[[150,.05],[150,.05],[200,.07],[660,.2]],
    upgrade:[[196,.08],[262,.08],[330,.08],[523,.22]], harden:[[220,.1],[330,.1],[440,.22]],
    install:[[262,.09],[392,.09],[523,.09],[784,.24]], uninstall:[[523,.08],[392,.08],[262,.15]],
    policy:[[330,.1],[440,.1],[550,.16]], parts:[[330,.06],[660,.12]],
    crew:[[294,.08],[392,.08],[587,.2]], compute:[[262,.08],[524,.08],[1048,.15]],
    r1:[[440,.08],[880,.18]], night:[[523,.16],[392,.16],[330,.26]],
    win:[[523,.1],[659,.1],[784,.1],[1047,.35]], bad:[[180,.12],[120,.22]]
  };
  function create(Context){
    let context=null,voices=[],generation=0;
    function stop(){generation++;for(const voice of voices){try{voice.stop();}catch{}}voices=[];}
    async function play(type){
      stop();const ticket=generation;
      try{
        const Constructor=Context||root.AudioContext||root.webkitAudioContext;
        if(!Constructor)return false;
        context??=new Constructor();
        if(context.state==='suspended')await context.resume();
        if(ticket!==generation||context.state!=='running')return false;
        let time=context.currentTime;
        for(const [frequency,duration] of patterns[type]||patterns.click){
          const oscillator=context.createOscillator(),gain=context.createGain();
          oscillator.type=['repair','upgrade','harden'].includes(type)?'triangle':'sine';
          oscillator.frequency.setValueAtTime(frequency,time);
          gain.gain.setValueAtTime(0,time);
          gain.gain.linearRampToValueAtTime(.045,time+.012);
          gain.gain.exponentialRampToValueAtTime(.001,time+duration);
          oscillator.connect(gain);gain.connect(context.destination);
          oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();voices=voices.filter(v=>v!==oscillator);};
          voices.push(oscillator);oscillator.start(time);oscillator.stop(time+duration+.02);time+=duration+.035;
        }
        return true;
      }catch{return false;}
    }
    return {play,stop};
  }
  const api={patterns,create};root.ValleySound=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
