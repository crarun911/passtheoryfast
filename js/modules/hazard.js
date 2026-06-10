// js/modules/hazard.js — Hazard Perception module
const Hazard = (() => {
  const CLIPS = [
    { title:'Clip 1 — Residential street',  scene:'urban',      hazard:'ped_stepout',   hazardStart:0.38, hazardEnd:0.58 },
    { title:'Clip 2 — Rural junction',       scene:'rural',      hazard:'car_junction',  hazardStart:0.42, hazardEnd:0.62 },
    { title:'Clip 3 — Town centre',          scene:'urban',      hazard:'cyclist_swerve',hazardStart:0.36, hazardEnd:0.56 },
    { title:'Clip 4 — Dual carriageway',     scene:'dual',       hazard:'car_merge',     hazardStart:0.44, hazardEnd:0.64 },
    { title:'Clip 5 — School zone',          scene:'urban',      hazard:'child_run',     hazardStart:0.32, hazardEnd:0.52 },
    { title:'Clip 6 — Country lane',         scene:'country',    hazard:'oncoming',      hazardStart:0.44, hazardEnd:0.64 },
    { title:'Clip 7 — Motorway',             scene:'motorway',   hazard:'lorry_lane',    hazardStart:0.46, hazardEnd:0.66 },
    { title:'Clip 8 — Roundabout',           scene:'roundabout', hazard:'fast_car',      hazardStart:0.40, hazardEnd:0.60 },
    { title:'Clip 9 — Road works',           scene:'roadworks',  hazard:'narrow',        hazardStart:0.38, hazardEnd:0.58 },
    { title:'Clip 10 — Night driving',       scene:'night',      hazard:'ped_dark',      hazardStart:0.40, hazardEnd:0.60 },
    { title:'Clip 11 — Wet dual carriageway',scene:'dual',       hazard:'brake_queue',   hazardStart:0.44, hazardEnd:0.64 },
    { title:'Clip 12 — Village road',        scene:'rural',      hazard:'tractor',       hazardStart:0.42, hazardEnd:0.62 },
    { title:'Clip 13 — Bus stop',            scene:'urban',      hazard:'bus_pullout',   hazardStart:0.36, hazardEnd:0.56 },
    { title:'Clip 14 — High street',         scene:'urban',      hazard:'car_reverse',   hazardStart:0.42, hazardEnd:0.62 },
  ];
  const CLIP_DUR = 60;

  let idx = 0, scores = [], clicked = false, score = 0, total = 0;
  let progress = 0, playing = false, raf = null;
  let startWall = null, pausedElapsed = 0;
  let ripples = [], hazCanvas, ripCanvas, ripCtx, CW, CH;

  function start() {
    idx = 0; scores = []; total = 0;
    UI.showScreen('screenHazard');
    UI.setTabs(1);
    setTimeout(() => { _initCanvas(); _loadClip(0); }, 100);
  }

  function _initCanvas() {
    hazCanvas = document.getElementById('hazCanvas');
    ripCanvas  = document.getElementById('rippleCanvas');
    const wrap = document.getElementById('hazVideoWrap');
    CW = wrap.clientWidth || 640;
    CH = Math.round(CW * 9/16);
    wrap.style.height = CH + 'px';
    hazCanvas.width = CW; hazCanvas.height = CH;
    ripCanvas.width  = CW; ripCanvas.height = CH;
    ripCtx = ripCanvas.getContext('2d');
    HazardScenes.init(hazCanvas, CW, CH);
  }

  function _loadClip(i) {
    if (raf) cancelAnimationFrame(raf);
    playing = false; progress = 0; pausedElapsed = 0; startWall = null;
    clicked = false; score = 0; ripples = [];
    if (ripCtx) ripCtx.clearRect(0,0,CW,CH);

    const clip = CLIPS[i];
    _el('clipCounter').textContent  = 'Clip ' + (i+1) + ' / ' + CLIPS.length;
    _el('clipBadge').textContent    = (i+1) + ' / ' + CLIPS.length;
    _el('hazScorePill').textContent = 'Score: ' + total + ' / ' + (i*5);
    _el('hazTitle').textContent     = clip.title;
    _el('hazFeedback').textContent  = 'Press Play, then click when you spot a developing hazard.';
    _el('hazProgressFill').style.width = '0%';
    _el('hazPlayBtn').textContent   = '▶ Play';
    _el('hazTimeCode').textContent  = '0:00 / 1:00';
    _el('hazTimerText').textContent = '1:00';
    _el('btnNextClip').style.display = 'none';
    _el('btnNextClip').style.background = '';
    _el('hazNotStarted').style.display = 'flex';
    _el('hazDetectedFlash').style.display = 'none';
    const sk = _el('btnSkipClip'); if(sk) sk.style.display = 'none';
    _el('hazClipHint').textContent = '';
    _resetBars();
    HazardScenes.draw(clip, 0);
  }

  function togglePlay() {
    playing ? _pause() : _play();
  }

  function _play() {
    playing = true;
    _el('hazPlayBtn').textContent = '⏸ Pause';
    _el('hazNotStarted').style.display = 'none';
    const sk = _el('btnSkipClip'); if(sk) sk.style.display = 'inline-block';
    startWall = performance.now() - pausedElapsed * 1000;
    _tick();
  }

  function _pause() {
    playing = false;
    cancelAnimationFrame(raf);
    pausedElapsed = progress * CLIP_DUR;
    _el('hazPlayBtn').textContent = '▶ Play';
  }

  function _tick() {
    if (!playing) return;
    const elapsed = (performance.now() - startWall) / 1000;
    progress = Math.min(1, elapsed / CLIP_DUR);
    const elSec  = Math.floor(elapsed);
    const remSec = Math.max(0, CLIP_DUR - elSec);
    _el('hazProgressFill').style.width = (progress*100) + '%';
    _el('hazTimeCode').textContent  = UI.fmt(elSec) + ' / 1:00';
    _el('hazTimerText').textContent = UI.fmt(remSec);
    HazardScenes.draw(CLIPS[idx], progress);
    _drawRipples();
    if (progress >= 1) { _endClip(); return; }
    raf = requestAnimationFrame(_tick);
  }

  function onClick(e) {
    if (!playing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = CW/rect.width, sy = CH/rect.height;
    ripples.push({ x:(e.clientX-rect.left)*sx, y:(e.clientY-rect.top)*sy, t:performance.now() });

    const clip = CLIPS[idx];
    if (!clicked && progress >= clip.hazardStart && progress <= clip.hazardEnd) {
      const pos = (progress - clip.hazardStart) / (clip.hazardEnd - clip.hazardStart);
      score = Math.max(1, Math.round(5 - pos*4));
      clicked = true;
      _showScore(score, true);
      _updateBars(score);
      const f = _el('hazDetectedFlash');
      f.style.display = 'block';
      setTimeout(() => { f.style.display = 'none'; }, 600);
    } else if (!clicked && progress < clip.hazardStart) {
      _showScore(0, false, 'Too early — the hazard has not developed yet. Keep watching.');
    } else if (!clicked) {
      _showScore(0, false, 'Too late — you missed the scoring window.');
    }
  }

  function _endClip() {
    if (raf) cancelAnimationFrame(raf);
    playing = false;
    _el('hazPlayBtn').textContent = '▶ Play';
    if (!clicked) {
      score = 0;
      _el('hazFeedback').innerHTML = '<strong style="color:var(--red)">✗ Missed.</strong> You did not click during the hazard window. You scored 0.';
    }
    scores.push(score); total += score;
    _el('hazScorePill').textContent = 'Score: ' + total + ' / ' + (scores.length*5);
    const sk = _el('btnSkipClip'); if(sk) sk.style.display = 'none';
    const isLast = idx >= CLIPS.length - 1;
    const btn = _el('btnNextClip');
    btn.textContent = isLast ? 'Finish & see results ✓' : 'Next clip →';
    btn.style.background = isLast ? 'var(--red)' : 'var(--green)';
    btn.style.borderColor = isLast ? 'var(--red)' : 'var(--green)';
    btn.style.color = '#fff';
    btn.style.display = 'inline-block';
    _el('hazClipHint').textContent = isLast
      ? 'All clips complete — click Finish to see your results.'
      : 'Clip ' + (idx+1) + ' of ' + CLIPS.length + ' complete.';
  }

  function skip() {
    if (raf) cancelAnimationFrame(raf);
    playing = false;
    _endClip();
  }

  function next() {
    idx++;
    if (idx >= CLIPS.length) {
      App.onHazardComplete({ scores, total });
    } else {
      _loadClip(idx);
    }
  }

  function _drawRipples() {
    if (!ripCtx) return;
    ripCtx.clearRect(0,0,CW,CH);
    const now = performance.now();
    ripples = ripples.filter(r => now-r.t < 700);
    ripples.forEach(r => {
      const a=(now-r.t)/700, rad=8+a*38;
      ripCtx.beginPath(); ripCtx.arc(r.x,r.y,rad,0,Math.PI*2);
      ripCtx.strokeStyle=`rgba(255,214,0,${1-a})`; ripCtx.lineWidth=3; ripCtx.stroke();
      ripCtx.beginPath(); ripCtx.arc(r.x,r.y,rad*0.5,0,Math.PI*2);
      ripCtx.strokeStyle=`rgba(255,255,255,${(1-a)*0.5})`; ripCtx.lineWidth=1.5; ripCtx.stroke();
    });
  }

  function _showScore(s, hit, errMsg) {
    const fb = _el('hazFeedback');
    if (hit) {
      const q = s===5?'Excellent — very early response!':s>=3?'Good response.':'You spotted it, but a little late.';
      fb.innerHTML = '<strong style="color:var(--success)">✓ Hazard detected!</strong> You scored <strong>'+s+' point'+(s!==1?'s':'')+'</strong>. '+q;
    } else {
      fb.innerHTML = '<strong style="color:var(--red)">✗ '+(errMsg||'Missed.')+'</strong>';
    }
  }

  function _updateBars(s) {
    for(let i=1;i<=5;i++){const el=_el('seg'+i);if(el)el.classList.toggle('active',i<=s);}
  }
  function _resetBars() {
    for(let i=1;i<=5;i++){const el=_el('seg'+i);if(el)el.classList.remove('active');}
  }
  function _el(id) { return document.getElementById(id); }

  return { start, togglePlay, onClick, skip, next };
})();
