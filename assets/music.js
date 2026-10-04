'use strict';
window.ValleyMusic = {
  create() {
    const track = new Audio('assets/winter.mp3');
    track.preload = 'none';
    let enabled = !!NR.read('music', true), unlocked = false, suspended = false;
    let starting = false, resting = false, frame = 0, restTimer = 0;
    const wanted = () => enabled && unlocked && !suspended && !resting && !document.hidden && !document.querySelector('dialog.cinema[open]');
    function pause() { cancelAnimationFrame(frame); track.pause(); track.volume = 0; }
    function sync() {
      if (!wanted()) { pause(); return; }
      if (!track.paused || starting) return;
      starting = true;
      track.volume = 0;
      track.play().then(() => {
        starting = false;
        if (!wanted()) { pause(); return; }
        const start = performance.now();
        function fade(now) {
          if (!wanted()) { pause(); return; }
          const progress = Math.min(1, (now - start) / 1800);
          track.volume = .09 * progress;
          if (progress < 1) frame = requestAnimationFrame(fade);
        }
        frame = requestAnimationFrame(fade);
      }).catch(() => { starting = false; });
    }
    function unlock() { unlocked = true; sync(); }
    document.addEventListener('pointerdown', unlock, {capture:true});
    document.addEventListener('keydown', unlock, {capture:true});
    document.addEventListener('visibilitychange', sync);
    addEventListener('pagehide', () => { clearTimeout(restTimer); pause(); });
    new MutationObserver(sync).observe(document.body, {childList:true, subtree:true});
    track.addEventListener('ended', () => {
      resting = true;
      restTimer = setTimeout(() => { resting = false; track.currentTime = 0; sync(); }, 30000);
    });
    return {
      enabled: () => enabled,
      toggle() { enabled = !enabled; NR.write('music', enabled); sync(); },
      suspend(value) { suspended = value; sync(); }
    };
  }
};
